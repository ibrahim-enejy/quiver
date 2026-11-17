/**
 * Anthropic SDK Wrapper — lib/ai/client.ts
 *
 * What it does: Provides the single Anthropic client instance for the entire app.
 *   Exposes a streaming helper that returns a ReadableStream for use in Next.js
 *   API route responses, and a non-streaming helper for shorter AI tasks (onboarding).
 *
 * What it reads from: ANTHROPIC_API_KEY environment variable.
 *
 * What it produces: ReadableStream of text chunks for streaming responses,
 *   or complete message content for non-streaming calls.
 *
 * Edge cases:
 *   - Missing API key: throws a descriptive error at initialization time.
 *   - Rate limits: caught and returned as structured errors with retryAfter hint.
 *   - Network failures: caught and wrapped in AIError with original cause.
 *   - Stream interruptions: the ReadableStream controller is properly closed on error.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_OPENROUTER_MODEL = 'anthropic/claude-sonnet-5.5';
const OPENROUTER_ANTHROPIC_BASE_URL = 'https://openrouter.ai/api';
const MAX_TOKENS = 8192;

export interface AIClientConfig {
  provider: 'openrouter' | 'anthropic';
  apiKey: string;
  baseURL?: string;
  model: string;
  defaultHeaders?: Record<string, string>;
}

/**
 * Resolves AI provider configuration from environment variables.
 * Prefers OPENROUTER_API_KEY (or any sk-or- key in ANTHROPIC_API_KEY) and falls
 * back cleanly to standard ANTHROPIC_API_KEY.
 */
export function resolveAIClientConfig(
  env: Record<string, string | undefined> = process.env
): AIClientConfig {
  const openRouterKey = env.OPENROUTER_API_KEY?.trim();
  const anthropicKey = env.ANTHROPIC_API_KEY?.trim();
  const apiKey = openRouterKey || anthropicKey;

  if (!apiKey) {
    throw new Error(
      'Neither OPENROUTER_API_KEY nor ANTHROPIC_API_KEY is set. Add one to your environment variables.'
    );
  }

  const isOpenRouter =
    Boolean(openRouterKey) || apiKey.startsWith('sk-or-');

  const model =
    env.QUIVER_AI_MODEL?.trim() ||
    (isOpenRouter ? DEFAULT_OPENROUTER_MODEL : DEFAULT_ANTHROPIC_MODEL);

  if (isOpenRouter) {
    return {
      provider: 'openrouter',
      apiKey,
      baseURL: env.QUIVER_AI_BASE_URL?.trim() || OPENROUTER_ANTHROPIC_BASE_URL,
      model,
      defaultHeaders: {
        'HTTP-Referer': env.NEXT_PUBLIC_APP_URL?.trim() || 'https://formatio.cloud',
        'X-Title': 'Formatio Quiver',
      },
    };
  }

  return {
    provider: 'anthropic',
    apiKey,
    ...(env.QUIVER_AI_BASE_URL?.trim()
      ? { baseURL: env.QUIVER_AI_BASE_URL.trim() }
      : {}),
    model,
  };
}

export interface AIError {
  code: 'api_error' | 'rate_limit' | 'auth_error' | 'network_error' | 'unknown_error';
  message: string;
  retryAfter?: number;
  cause?: unknown;
}

interface StreamOptions {
  system: string;
  messages: MessageParam[];
  maxTokens?: number;
}

let _client: Anthropic | null = null;
let _clientCacheKey: string | null = null;

function getClient(): { client: Anthropic; config: AIClientConfig } {
  const config = resolveAIClientConfig();
  const cacheKey = `${config.provider}:${config.apiKey.slice(0, 12)}:${config.baseURL ?? ''}:${config.model}`;
  if (_client && _clientCacheKey === cacheKey) {
    return { client: _client, config };
  }
  _client = new Anthropic({
    apiKey: config.apiKey,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
    ...(config.defaultHeaders ? { defaultHeaders: config.defaultHeaders } : {}),
  });
  _clientCacheKey = cacheKey;
  return { client: _client, config };
}

function classifyError(error: unknown): AIError {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 429) {
      return {
        code: 'rate_limit',
        message: 'Rate limit exceeded. Please try again shortly.',
        retryAfter: 30,
        cause: error,
      };
    }
    if (error.status === 401) {
      return {
        code: 'auth_error',
        message: 'Invalid Anthropic API key. Check your ANTHROPIC_API_KEY.',
        cause: error,
      };
    }
    return {
      code: 'api_error',
      message: error.message,
      cause: error,
    };
  }
  if (error instanceof Error && error.message.includes('fetch')) {
    return {
      code: 'network_error',
      message: 'Network error connecting to Anthropic API.',
      cause: error,
    };
  }
  return {
    code: 'unknown_error',
    message: error instanceof Error ? error.message : 'An unknown error occurred.',
    cause: error,
  };
}

/**
 * Creates a ReadableStream that streams text content from the Anthropic API.
 * Used by API routes to stream responses to the client.
 */
export function createStream(options: StreamOptions): {
  stream: ReadableStream<Uint8Array>;
  error?: never;
} | {
  stream?: never;
  error: AIError;
} {
  const encoder = new TextEncoder();

  try {
    const { client, config } = getClient();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const response = client.messages.stream({
            model: config.model,
            max_tokens: options.maxTokens ?? MAX_TOKENS,
            system: options.system,
            messages: options.messages,
          });

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          controller.close();
        } catch (err) {
          const aiError = classifyError(err);
          controller.enqueue(
            encoder.encode(`\n\n[ERROR: ${aiError.message}]`)
          );
          controller.close();
        }
      },
    });

    return { stream };
  } catch (err) {
    return { error: classifyError(err) };
  }
}

/**
 * Sends a non-streaming message to the Anthropic API.
 * Used for shorter tasks like onboarding AI assist.
 */
export async function sendMessage(options: StreamOptions): Promise<
  { content: string; error?: never } | { content?: never; error: AIError }
> {
  try {
    const { client, config } = getClient();

    const response = await client.messages.create({
      model: config.model,
      max_tokens: options.maxTokens ?? MAX_TOKENS,
      system: options.system,
      messages: options.messages,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock) {
      return {
        error: {
          code: 'api_error' as const,
          message: `AI response contained no text content (got ${response.content.map((b) => b.type).join(', ') || 'empty'})`,
        },
      };
    }
    return { content: textBlock.text };
  } catch (err) {
    return { error: classifyError(err) };
  }
}
