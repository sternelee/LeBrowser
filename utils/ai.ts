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
import { determineStepType, executeTool } from 'xsai';

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

/** @internal */
type RawGenerateText = (
  response: GenerateTextResponse,
  options: GenerateTextOptions,
) => RawGenerateTextTrampoline<GenerateTextResult>;

/** @internal */
type RawGenerateTextTrampoline<T> = Promise<
  (() => RawGenerateTextTrampoline<T>) | T
>;

/** @internal */
const rawGenerateText: RawGenerateText = async (
  response: GenerateTextResponse,
  options: GenerateTextOptions,
) => {
  const { choices, usage } = response;

  if (!choices?.length)
    throw new Error(
      `No choices returned, response body: ${JSON.stringify(response)}`,
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

  return {
    options,
    finishReason,
    messages,
    steps,
    text: message.content,
    toolCalls,
    toolResults,
    usage,
  };
};

export const generateText = async (
  response: GenerateTextResponse,
  options: GenerateTextOptions,
): Promise<GenerateTextResult> =>
  trampoline<GenerateTextResult>(async () =>
    rawGenerateText(response, options),
  );
