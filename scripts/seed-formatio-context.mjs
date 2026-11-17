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
    'Formatio is the unified delivery, OpenTelemetry observability, governed runtime, and AI SRE workspace ($200/month flat per organization) for Seed-to-Series A engineering teams and their coding agents (/mcp).',
  icpDefinition: {
    definition:
      'Seed to Series A engineering organizations (4-35 engineers) running production workloads across multi-tool DIY stacks (GitHub Actions + ECS/Kubernetes/Render + Datadog/Sentry) who want unified deployment-to-incident ownership without a dedicated platform engineering hire.',
    decisionMaker:
      'CTO, VP Engineering, or Founding Engineer tired of fragile CI YAML, surprise per-host APM bills, and manual incident war rooms.',
    primaryUseCase:
      'Connect your own servers/cloud via SSH/Docker Swarm or cloud hosts, deploy with zero-code Railpack OpenTelemetry injection, inspect distributed traces/errors inside the same control plane (or via /mcp in Claude Code/Cursor), and review autonomous AI SRE fix PRs with SSO governance.',
    jobsToBeDone:
      'Ship production services in minutes without managing Kubernetes manifests; trace production 500s straight back to the suspect commit; resolve recurring bugs via automated fix PRs while keeping enterprise SSO access controls.',
  },
  messagingPillars: [
    {
      pillar:
        'Deploy -> Observe -> Resolve in one control plane (IDP, Observability, AI SRE, Govern)',
    },
    {
      pillar:
        'Zero-code Railpack OpenTelemetry instrumentation correlated automatically to Git releases',
    },
    {
      pillar:
        'AI SRE that investigates OTel traces, identifies suspect commits, and opens reviewed fix PRs',
    },
    {
      pillar:
        'Production workspace for humans and coding agents via native /mcp server and Govern SSO',
    },
    {
      pillar:
        '$200/month flat per organization: no per-seat, per-cluster, or per-host tax',
    },
  ],
  competitiveLandscape: [
    {
      name: 'Qovery',
      notes:
        'Kubernetes-only DevOps automation ($299 Starter / $899 Growth + $299/cluster Observe add-on). Strong AWS EKS automation and Terraform support, but lacks native OTel distributed tracing, error grouping, and AI SRE fix PRs.',
    },
    {
      name: 'Datadog / New Relic',
      notes:
        'Per-host and usage-billed observability giants. Powerful APM, but zero deployment control and unpredictable cost scaling for 4-35 engineer teams.',
    },
    {
      name: 'Render / Coolify / Dokploy',
      notes:
        'Clean app deployment (or self-hosted PaaS), but stop at build/deploy: teams still stitch separate tools for distributed tracing, error grouping, suspect commits, and AI SRE remediation.',
    },
  ],
  customerLanguage: {
    verbatims: [
      'Why do we need four tools and three browser tabs just to trace a failed deploy back to a commit?',
      'Our Datadog bill tripled once we enabled container logs on staging.',
      'We do not want a full-time engineer maintaining AWS EKS clusters and OTel Collector sidecars.',
      'Can Claude Code or Cursor just pull the live production trace instead of me pasting 200 lines of stack traces into Slack?',
    ],
  },
  proofPoints: [
    {
      point: '$200/month flat org pricing covering IDP, Observability, AI SRE, and Govern (free tier included).',
      verified: true,
    },
    {
      point: 'AI SRE opens fix PRs automatically from OTel trace and suspect-commit context.',
      verified: true,
    },
    {
      point: 'Govern ships with SSO and scoped organization access controls.',
      verified: true,
    },
    {
      point: 'Native /mcp endpoint connects Claude Code, Cursor, and Gemini CLI directly to production releases and occurrences.',
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
      title: '$200/mo Flat Pricing + Zero-K8s Server Simplicity Wins Qovery Evaluators',
      status: 'TESTING',
    },
    {
      id: 'H4',
      title: 'Zero-Code Railpack OTel Is the Fastest "Aha!" Activation Milestone',
      status: 'TESTING',
    },
  ],
  brandVoice:
    'Technical practitioner voice modeled on PostHog and Infisical: alternate longer precise mechanisms with short punchy sentences; one idea per paragraph (1-4 sentences); teach the engineering process before mentioning the tool; dry earned humor; zero AI hype.',
  wordsToUse: [
    'openTelemetry',
    'suspect commit',
    'fix PR',
    'control plane',
    'deploy correlation',
    '/mcp',
    'zero-code instrumentation',
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
          'Seeded Formatio GTM operating context ($200/mo pricing, AI SRE fix PRs, Govern SSO, Qovery battlecard, H1-H4 hypotheses).',
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
