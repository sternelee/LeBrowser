import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
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
