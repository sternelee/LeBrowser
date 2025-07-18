import type {
  AssistantMessageResponse,
  ChatOptions,
  CompletionStep,
  CompletionToolCall,
  CompletionToolResult,
  FinishReason,
  Message,
  Usage,
} from 'xsai';

import { trampoline } from 'xsai';
import {
  determineStepType,
  executeTool,
  requestURL,
  requestBody,
  clean,
  requestHeaders,
  responseCatch,
} from 'xsai';
import { fetch } from 'expo/fetch';

export interface GenerateTextOptions extends ChatOptions {
  /** @default 1 */
  maxSteps?: number;
  onStepFinish?: (step: CompletionStep<true>) => Promise<unknown> | unknown;
  /** @internal */
  steps?: CompletionStep<true>[];
  /** if you want to enable stream, use `@xsai/stream-{text,object}` */
  stream?: never;
}

export interface GenerateTextResponse {
  choices: {
    finish_reason: FinishReason;
    index: number;
    message: AssistantMessageResponse;
  }[];
  created: number;
  id: string;
  model: string;
  object: 'chat.completion';
  system_fingerprint: string;
  usage: Usage;
}

export interface GenerateTextResult {
  finishReason: FinishReason;
  messages: Message[];
  steps: CompletionStep<true>[];
  text?: string;
  toolCalls: CompletionToolCall[];
  toolResults: CompletionToolResult[];
  usage: Usage;
}

export const chat = async <T extends ChatOptions>(options: T) =>
  fetch(requestURL('chat/completions', options.baseURL).href, {
    body: requestBody({
      ...options,
      tools: options.tools?.map((tool) => ({
        function: clean({
          ...tool.function,
          returns: undefined,
        }),
        type: 'function',
      })),
    }),
    headers: requestHeaders(
      {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      options.apiKey,
    ),
    method: 'POST',
    signal: options.abortSignal,
  }).then(responseCatch);

const responseJSON = async <T>(res: Response): Promise<T> =>
  responseCatch(res).then(async (res) => {
    console.log('res:', res);
    const text = await res.json();
    console.log('text:', text);

    try {
      // eslint-disable-next-line @masknet/type-prefer-return-type-annotation
      return text as T;
    } catch {
      throw new Error(`Failed to parse response, response body: ${text}`);
    }
  });

/** @internal */
type RawGenerateText = (
  options: GenerateTextOptions,
) => RawGenerateTextTrampoline<GenerateTextResult>;

/** @internal */
type RawGenerateTextTrampoline<T> = Promise<
  (() => RawGenerateTextTrampoline<T>) | T
>;

/** @internal */
const rawGenerateText: RawGenerateText = async (options: GenerateTextOptions) =>
  chat({
    ...options,
    maxSteps: undefined,
    messages: options.messages,
    steps: undefined,
    stream: false,
  })
    .then(responseJSON<GenerateTextResponse>)
    .then(async (res) => {
      const { choices, usage } = res;

      if (!choices?.length)
        throw new Error(
          `No choices returned, response body: ${JSON.stringify(res)}`,
        );

      const messages: Message[] = structuredClone(options.messages);
      const steps: CompletionStep<true>[] = options.steps
        ? structuredClone(options.steps)
        : [];
      const toolCalls: CompletionToolCall[] = [];
      const toolResults: CompletionToolResult[] = [];

      const { finish_reason: finishReason, message } = choices[0];
      const msgToolCalls = message?.tool_calls ?? [];

      const stepType = determineStepType({
        finishReason,
        maxSteps: options.maxSteps ?? 1,
        stepsLength: steps.length,
        toolCallsLength: msgToolCalls.length,
      });

      messages.push(message);

      if (finishReason === 'stop' || stepType === 'done') {
        const step: CompletionStep<true> = {
          finishReason,
          stepType,
          text: message.content,
          toolCalls,
          toolResults,
          usage,
        };

        steps.push(step);

        if (options.onStepFinish) await options.onStepFinish(step);

        return {
          finishReason,
          messages,
          steps,
          text: message.content,
          toolCalls,
          toolResults,
          usage,
        };
      }

      for (const toolCall of msgToolCalls) {
        const { completionToolCall, completionToolResult, message } =
          await executeTool({
            abortSignal: options.abortSignal,
            messages,
            toolCall,
            tools: options.tools,
          });
        toolCalls.push(completionToolCall);
        toolResults.push(completionToolResult);
        messages.push(message);
      }

      const step: CompletionStep<true> = {
        finishReason,
        stepType,
        text: message.content,
        toolCalls,
        toolResults,
        usage,
      };

      steps.push(step);

      if (options.onStepFinish) await options.onStepFinish(step);

      return async () =>
        rawGenerateText({
          ...options,
          messages,
          steps,
        });
    });

export const generateText = async (
  options: GenerateTextOptions,
): Promise<GenerateTextResult> =>
  trampoline<GenerateTextResult>(async () => rawGenerateText(options));
