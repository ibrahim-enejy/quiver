import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole('viewer');
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const key = openRouterKey || anthropicKey;
  const isSet = !!key && key.length > 10;
  const provider =
    isSet && (Boolean(openRouterKey) || key.startsWith('sk-or-'))
      ? 'openrouter'
      : 'anthropic';
  const model =
    process.env.QUIVER_AI_MODEL?.trim() ||
    (provider === 'openrouter'
      ? 'anthropic/claude-sonnet-5.5'
      : 'claude-sonnet-4-20250514');

  // Return a masked hint (first 7 + last 4 chars) so the UI can confirm which key
  let hint: string | null = null;
  if (isSet) {
    hint = key.substring(0, 7) + '...' + key.substring(key.length - 4);
  }

  return NextResponse.json({ isSet, hint, provider, model });
}
