# Keep only live releases

2026-11-24. Release cleanup now uses a deploy lock, verified live path, public
health gate, nginx/cron/dependency/process checks, and scoped PM2/Next worker
stopping before deleting old application releases. Shared data and backups are
excluded. Rollback rebuilds an earlier GitHub commit. Existing space guards
remain. See deploy/RETENTION.md (Elek: deploy/RETENTION.md plus bluegreen scripts).

The authorized one-time server cleanup left one live application release for
this project. Its existing live application commit was preserved. Modified
operational code was committed and pushed through GitHub; no local application
source was copied to production. Bash syntax and shared cleanup regression
checks passed. No application tests were run against a shared database, no
paid API calls occurred, and no new UI was introduced.

The full cross-project before/after sizes, live revisions, health evidence,
limits and incidents are recorded in commerce/docs/briefs/release-keep-only-live.result.md.
Maphey, Sayt and Reklam use a new mandatory post-health finalizer for their
existing manual release workflow; this does not claim a full new build system.
