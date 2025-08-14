import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';

function getProvider(
  provider: string,
  apiKey?: string
): typeof openai | typeof anthropic | typeof google {
  switch (provider) {
    case 'openai':
      return openai({ apiKey });
    case 'anthropic':
      return anthropic({ apiKey });
    case 'google':
      return google({ apiKey });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(req: Request) {
  const {
    messages,
    provider,
    apiKey,
  }: { messages: UIMessage[]; provider: string; apiKey?: string } =
    await req.json();

  const model = getProvider(provider, apiKey)('gpt-4o'); // Note: model name might need to be dynamic too

  const result = await streamText({
    model: model,
    messages: convertToModelMessages(messages),
    tools: {
      summarizeWebsite: tool({
        description:
          'Summarize the content of the current website. The user will not provide the content, you must use this tool to ask the client to provide it.',
        inputSchema: z.object({}),
      }),
      translateWebsite: tool({
        description:
          'Translate the content of the current website to a specified language.',
        inputSchema: z.object({
          language: z
            .string()
            .describe('The language to translate the content to.'),
        }),
      }),
      answerQuestionAboutWebsite: tool({
        description:
          'Answer a question about the content of the current website. The user will provide a question but not the content.',
        inputSchema: z.object({
          question: z
            .string()
            .describe('The question to answer about the website.'),
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
}
