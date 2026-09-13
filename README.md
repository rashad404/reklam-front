# Reklam.biz frontend

Next.js 16 / React 19. Node 22 is the release baseline. Read AGENTS.md and docs/knowledge/product-standard.md before product changes. Shared knowledge is mirrored from the parent workspace.

Run `npm ci`, copy `.env.example` to `.env.local`, set API and OAuth settings, then `npm run dev` (port 3059). API preview uses 8059. Never use production data for automated interaction tests.

Checks: `npm run lint`, `npm run build`, `npm run test:e2e`. Browser tests require Chrome and isolated backend fixtures; see docs/knowledge/runbook.md. `NEXT_PUBLIC_LOCAL_TEST_LOGIN` must be false in production. Public environment values are compiled into the bundle; restart alone does not update them.

Public pages are localized under unprefixed Azerbaijani, /en and /ru. Private workspaces are noindex and APIs enforce ownership. Payments are unavailable in this release. Legacy /serve.js and /api paths proxy to the configured API host.

Use the release runbook for deployment and rollback. No app files should be edited directly on production.
