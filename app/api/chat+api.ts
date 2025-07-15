import {
  generateText,
  generateId,
  generateObject,
  streamObject,
  streamText,
  embed,
  experimental_generateImage as generateImage,
  experimental_transcribe as transcribe,
  experimental_generateSpeech as generateSpeech,
  convertToModelMessages,
  type StreamTextResult,
  type UIMessage,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createXai } from '@ai-sdk/xai';
import { createGroq } from '@ai-sdk/groq';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createZhipu } from 'zhipu-ai-provider';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAzure } from '@ai-sdk/azure';
// import { createFal } from '@ai-sdk/fal';
// import { createReplicate } from '@ai-sdk/replicate';

export enum AgentMode {
  GenerateText = 'generateText',
  StreamText = 'streamText',
  GenerateObject = 'generateObject',
  StreamObject = 'streamObject',
  Embed = 'embed',
  GenerateImage = 'generateImage',
  Transcribe = 'transcribe',
  GenerateSpeech = 'generateSpeech',
}

export const agentCallMap = {
  [AgentMode.GenerateText]: generateText,
  [AgentMode.StreamText]: streamText,
  [AgentMode.GenerateObject]: generateObject,
  [AgentMode.StreamObject]: streamObject,
  [AgentMode.Embed]: embed,
  [AgentMode.GenerateImage]: generateImage,
  [AgentMode.Transcribe]: transcribe,
  [AgentMode.GenerateSpeech]: generateSpeech,
};

export enum Provider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Groq = 'groq',
  XAI = 'xai',
  DeepSeek = 'deepseek',
  Zhipu = 'zhipu',
  OpenRouter = 'openrouter',
  AzureOpenAI = 'azure',
  Google = 'google',
  SiliconFlow = 'siliconflow',
  // Fal = 'fal',
  // Replicate = 'replicate',
}

export const createAgentModel = (
  provider: Provider,
  apiKey: string,
  baseURL?: string,
) => {
  if (provider === Provider.OpenAI) {
    return createOpenAI({
      apiKey,
    });
  }
  if (provider === Provider.Anthropic) {
    return createAnthropic({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }
  if (provider === Provider.Groq) {
    return createGroq({
      apiKey,
      // baseURL: baseURL || undefined
    });
  }
  if (provider === Provider.XAI) {
    return createXai({
      apiKey,
      // baseURL: baseURL || undefined
    });
  }
  if (provider === Provider.DeepSeek) {
    return createDeepSeek({
      apiKey,
      // baseURL: baseURL || undefined
    });
  }
  if (provider === Provider.Zhipu) {
    return createZhipu({
      apiKey,
      // baseURL: baseURL || undefined
    });
  }
  if (provider === Provider.OpenRouter) {
    return createOpenRouter({
      apiKey,
      // baseURL: baseURL || undefined
    });
  }
  if (provider === Provider.AzureOpenAI) {
    return createAzure({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }
  if (provider === Provider.Google) {
    return createGoogleGenerativeAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }
  if (provider === Provider.SiliconFlow) {
    return createOpenAI({
      apiKey,
      baseURL: 'https://api.siliconflow.cn/v1',
    });
  }
  // if (provider === Provider.Fal) {
  //   return createFal({
  //     apiKey,
  //   });
  // }
  // if (provider === Provider.Replicate) {
  //   return createReplicate({
  //     apiToken: apiKey,
  //     // baseURL: baseURL || undefined
  //   });
  // }
  return null;
};

export async function POST(req: Request) {
  const {
    mode = AgentMode.StreamText,
    provider,
    messages,
    model,
    apiKey,
    ...rest
  }: {
    mode: AgentMode;
    provider: Provider;
    messages: UIMessage[];
    model: string;
    apiKey: string;
  } = await req.json();
  const factory = createAgentModel(provider, apiKey);
  if (!factory) {
    return new Response('Invalid provider', { status: 400 });
  }
  const providerModel = factory(model);
  if (mode === AgentMode.StreamText) {
    const result = streamText({
      // @ts-ignore
      model: providerModel,
      messages: convertToModelMessages(messages),
      ...rest,
    });
    return result.toUIMessageStreamResponse();
  }
  if (mode === AgentMode.GenerateText) {
    const result = await generateText({
      // @ts-ignore
      model: providerModel,
      messages: convertToModelMessages(messages),
      ...rest,
    });
    return new Response(JSON.stringify(result));
  }
  return new Response('Invalid mode', { status: 400 });
}
