import { describe, expect, it } from 'vitest';

import { resolveAIClientConfig } from '@/lib/ai/client';

describe('resolveAIClientConfig', () => {
  it('prefers OPENROUTER_API_KEY and defaults to OpenRouter anthropic/claude-sonnet-5.5', () => {
    const cfg = resolveAIClientConfig({
      OPENROUTER_API_KEY: 'sk-or-v1-test-key',
      ANTHROPIC_API_KEY: 'sk-ant-ignored',
      NEXT_PUBLIC_APP_URL: 'https://quiver.formatio.cloud',
    });

    expect(cfg.provider).toBe('openrouter');
    expect(cfg.apiKey).toBe('sk-or-v1-test-key');
    expect(cfg.baseURL).toBe('https://openrouter.ai/api');
    expect(cfg.model).toBe('anthropic/claude-sonnet-5.5');
    expect(cfg.defaultHeaders).toEqual({
      'HTTP-Referer': 'https://quiver.formatio.cloud',
      'X-Title': 'Formatio Quiver',
    });
  });

  it('auto-detects sk-or- keys passed in ANTHROPIC_API_KEY', () => {
    const cfg = resolveAIClientConfig({
      ANTHROPIC_API_KEY: 'sk-or-v1-via-anthropic-var',
      QUIVER_AI_MODEL: 'anthropic/claude-opus-5.5',
    });

    expect(cfg.provider).toBe('openrouter');
    expect(cfg.baseURL).toBe('https://openrouter.ai/api');
    expect(cfg.model).toBe('anthropic/claude-opus-5.5');
  });

  it('uses direct Anthropic when only sk-ant- key is set', () => {
    const cfg = resolveAIClientConfig({
      ANTHROPIC_API_KEY: 'sk-ant-api03-test',
    });

    expect(cfg.provider).toBe('anthropic');
    expect(cfg.baseURL).toBeUndefined();
    expect(cfg.model).toBe('claude-sonnet-4-20250514');
  });

  it('throws a descriptive error when no key is configured', () => {
    expect(() => resolveAIClientConfig({})).toThrow(/OPENROUTER_API_KEY/);
  });
});
