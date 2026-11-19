/**
 * Idempotently seeds Quiver's active ContextVersion with Formatio's
 * positioning, ICP, competitive landscape, brand voice, and active hypotheses.
 *
 * Usage:
 *   node scripts/seed-formatio-context.mjs [--force]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const force = process.argv.includes('--force');

const FORMATIO_CONTEXT = {
  positioningStatement:
    'Formatio is the unified delivery, lightweight OpenTelemetry observability, governed runtime, and AI SRE operating layer ($200/month flat per organization after a 14-day free trial) for both lean engineering teams and enterprise divisions, plus coding agents (/mcp). Interactive playground: https://playground.formatio.cloud.',
  icpDefinition: {
    definition:
      'Public site welcomes engineering teams of all sizes (4 to 500+ engineers) tired of stitching CI scripts, separate APMs, and AI log copy-pasting; outbound prioritizes 4-35 engineer teams for fast onboarding.',
    decisionMaker:
      'CTO, VP Engineering, Founding/Staff Engineer, or Platform/Security Lead rejecting per-seat APM bills and manual incident war rooms.',
    primaryUseCase:
      'Deploy from Git onto your own hosts, clouds, or clusters (Docker Swarm, Kubernetes, AWS ECS, Google Cloud Run, or bare metal), instrument via automatic Railpack OTel or a lightweight 2-3 line SDK hook, connect any MCP coding agent with secret redaction, and review autonomous AI SRE fix PRs with SSO governance included.',
    jobsToBeDone:
      'Push from Git without managing CI glue; trace failures straight to the suspect commit; resolve runtime bugs and live CVEs via human-reviewed pull requests while keeping SSO and enterprise secret isolation.',
  },
  messagingPillars: [
    {
      pillar:
        'Push to your servers -> Trace every deploy -> AI SRE fix PR -> Govern SSO ($200/month flat, 14-day free trial)',
    },
    {
      pillar:
        'Lightweight OpenTelemetry: automatic on supported Railpack builds or a 2-3 line SDK hook anywhere, standard OTLP, zero collector sidecars',
    },
    {
      pillar:
        'Runs on your own infrastructure across Docker Swarm, Kubernetes, AWS ECS, Google Cloud Run, or bare metal',
    },
    {
      pillar:
        'Agent-agnostic /mcp server connecting Cursor, Claude Code, Codex, Copilot, or custom MCP clients without exposing secret values',
    },
    {
      pillar:
        'Try the full loop without signing in at https://playground.formatio.cloud',
    },
  ],
  competitiveLandscape: [
    {
      name: 'Qovery',
      notes:
        'Kubernetes-centric control plane ($299 Starter / $899 Growth + $299/cluster Observe add-on, SSO gated higher). Strong Kubernetes/EKS automation, whereas Formatio runs multi-runtime (Docker Swarm, Kubernetes, ECS, Cloud Run), includes SSO + lightweight OTel + AI SRE PRs at $200/month flat.',
    },
    {
      name: 'Datadog / New Relic / Sentry',
      notes:
        'Per-host, per-seat, and span-ingestion observability tools with zero Git-to-cluster deployment control.',
    },
    {
      name: 'Render / Coolify / Dokploy',
      notes:
        'Clean app deployers that stop after container boot—teams still stitch separate tools for OTel tracing, suspect-commit error grouping, and AI SRE fix PRs.',
    },
  ],
  customerLanguage: {
    verbatims: [
      'Why do we need four tools and three browser tabs just to trace a failed deploy back to a commit?',
      'Stop being the clipboard between your tools and AI.',
      'We want distributed OpenTelemetry traces without maintaining collector sidecars.',
      'Can our coding agent read live production stack frames over MCP without ever seeing .env secret values?',
    ],
  },
  proofPoints: [
    {
      point: '$200/month flat org pricing (starting with a 14-day free trial) covering IDP, Observability, AI SRE, and Govern.',
      verified: true,
    },
    {
      point: 'Live interactive playground at https://playground.formatio.cloud lets visitors click through all 4 products with no sign-in required.',
      verified: true,
    },
    {
      point: 'Supports Docker Swarm, Kubernetes, AWS ECS, and Google Cloud Run on infrastructure you own.',
      verified: true,
    },
    {
      point: 'Automatic Railpack tracing or lightweight 2-3 line OTel SDK hook exporting standard OTLP.',
      verified: true,
    },
    {
      point: 'Agent-agnostic /mcp endpoint with expiring scoped tokens where get_application returns variable names only.',
      verified: true,
    },
  ],
  activeHypotheses: [
    {
      id: 'H1',
      title: 'The "Broken Loop" Process Wedge Beats "All-in-One Tool" Pitching',
      status: 'TESTING',
    },
    {
      id: 'H2',
      title: 'Coding Agents in Production (/mcp + AI SRE PRs) Is Our Fastest Viral Hook',
      status: 'TESTING',
    },
    {
      id: 'H3',
      title: '$200/mo Flat Pricing + Multi-Runtime Simplicity Wins PaaS Evaluators',
      status: 'TESTING',
    },
    {
      id: 'H4',
      title: 'Interactive Playground + Lightweight OTel Is the Fastest "Aha!" Activation Milestone',
      status: 'TESTING',
    },
  ],
  brandVoice:
    'Technical practitioner voice modeled on PostHog and Infisical: strict sentence case, longer precise mechanisms paired with short punchy sentences; one idea per paragraph; teach the process before mentioning the tool; dry earned humor; zero AI hype.',
  wordsToUse: [
    'OpenTelemetry',
    'suspect commit',
    'fix PR',
    'control plane',
    'deploy correlation',
    '/mcp',
    '14-day free trial',
    'playground.formatio.cloud',
    'flat $200/month',
  ],
  wordsToAvoid: [
    'delve',
    'tapestry',
    'unlock',
    'unleash',
    'supercharge',
    'game-changer',
    'paradigm shift',
    'cutting-edge',
    'seamless',
    'seamlessly',
    'robust',
    'holistic',
    'synergy',
    'moreover',
    'furthermore',
  ],
};

async function main() {
  const existing = await prisma.contextVersion.findFirst({
    where: { isActive: true },
  });

  if (existing && !force) {
    console.log(
      `Active ContextVersion v${existing.version} already exists. Pass --force to create a new version.`
    );
    return;
  }

  const latest = await prisma.contextVersion.findFirst({
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const created = await prisma.$transaction(async (tx) => {
    await tx.contextVersion.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return tx.contextVersion.create({
      data: {
        ...FORMATIO_CONTEXT,
        version: nextVersion,
        isActive: true,
        updatedBy: 'sarafadeen@formatio.cloud',
        updateSource: 'manual_seed',
        changeSummary:
          'Synced Formatio GTM operating context v2.1.0 ($200/mo flat, 14-day free trial, playground.formatio.cloud, multi-runtime Swarm/K8s/ECS/Cloud Run, lightweight OTel, agent-agnostic /mcp).',
      },
    });
  });

  console.log(`Seeded active Formatio ContextVersion v${created.version} (id=${created.id}).`);
}

main()
  .catch((err) => {
    console.error('Failed to seed Formatio context:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
