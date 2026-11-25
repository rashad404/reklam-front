# Release retention

After a successful GitHub-built deployment and public/API health checks, run
`bash deploy/finalize-release.sh` as root from the fetched operational scripts.
No automatic build/deploy script existed for this immutable-release workflow;
this finalizer is the mandatory final step of its release procedure.
It locks deployment, verifies the live target and health, stops only old-release
PM2 apps, and refuses active nginx/cron/process/dependency references.
Do not run after failed checks. Keep only the live application release.
Rollback means rebuilding an earlier GitHub commit, never a retained copy.
Never prune shared storage, secrets, database backups or the build in progress.
All manual build/switch operations must hold the same deploy.lock through this
step (fd 9). Dependencies must live inside the live release or shared storage,
never symlink into an old release. No space guard is lowered by this change.
