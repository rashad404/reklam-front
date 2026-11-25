#!/usr/bin/env python3
"""Prune verified inactive releases under the deployment lock, never shared data."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time


def run(args, **kw):
    return subprocess.run(args, check=True, **kw)


def candidates(base, live, releases=None):
    releases = releases or base / 'releases'
    if releases.is_symlink() or live.parent != releases or not live.is_dir():
        raise RuntimeError('Live release must be a direct real releases directory')
    result = []
    for path in releases.iterdir():
        if path.is_file() and (path.name.endswith('.log') or path.name == 'deploy.lock'):
            continue
        if path.is_symlink() or not path.is_dir() or not re.fullmatch(r'(?:[a-f0-9]{7,40}|[0-9]{8}-[a-z0-9-]+)', path.name):
            raise RuntimeError('Unexpected release entry: ' + str(path))
        if path != live:
            result.append(path)
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--base', required=True)
    p.add_argument('--user', required=True)
    p.add_argument('--source')
    p.add_argument('--live-process')
    p.add_argument('--pm2-home')
    p.add_argument('--public-root')
    p.add_argument('--health-url', required=True)
    p.add_argument('--apply', action='store_true')
    a = p.parse_args()
    base = Path(a.base)
    if not re.fullmatch(r'/home/[a-z0-9-]+/[a-z0-9-]+', str(base)):
        raise RuntimeError('Invalid deployment base')
    # Deploy scripts pass their locked fd 9. Standalone maintenance locks itself.
    try:
        inherited = Path('/proc/self/fd/9').resolve() == base / 'deploy.lock'
    except OSError:
        inherited = False
    lock = None
    if not inherited:
        lock = open(base / 'deploy.lock', 'a')
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    env = dict(os.environ, PATH='/opt/cpanel/ea-nodejs22/bin:' + os.environ['PATH'])
    if a.pm2_home:
        env['PM2_HOME'] = a.pm2_home
    prefix = ['runuser', '-u', a.user, '--']
    def process_list():
        raw = subprocess.check_output(prefix + ['pm2', 'jlist'], env=env, text=True)
        # PM2 may prefix JSON with a daemon-version notice. Never log its env.
        for line in raw.splitlines():
            if line.startswith('[{') or line.strip() == '[]':
                return json.loads(line)
        raise RuntimeError('PM2 did not return a process list')
    processes = process_list()
    def live_path():
        if not a.live_process:
            return (base / 'current').resolve(strict=True)
        rows = [r for r in process_list() if r['name'] == a.live_process and r.get('pid')]
        if len(rows) != 1:
            raise RuntimeError('Expected exactly one running live process')
        path = Path(rows[0]['pm2_env']['pm_cwd']).resolve(strict=True)
        while path.parent != base and path != path.parent:
            path = path.parent
        return path
    live = live_path()
    if a.public_root and not str(Path(a.public_root).resolve(strict=True)).startswith(str(live) + '/'):
        raise RuntimeError('API and frontend must use the same live release before cleanup')
    old = candidates(base, live, base if a.live_process else None)
    run(['curl', '--max-time', '30', '-fsS', a.health_url, '-o', '/dev/null'])
    nginx = subprocess.check_output(['nginx', '-T'], stderr=subprocess.DEVNULL, text=True)
    for directory, dirs, files in os.walk(str(live), followlinks=False):
        for name in dirs + files:
            link = Path(directory) / name
            if link.is_symlink() and any(str(link.resolve()).startswith(str(path) + '/') for path in old):
                raise RuntimeError('Live release depends on an old release: ' + str(link))
    for cron in list(Path('/etc/cron.d').glob('*')) + [Path('/var/spool/cron') / a.user]:
        if cron.is_file():
            nginx += cron.read_text()
    for path in old:
        if str(path) in nginx:
            raise RuntimeError('Inactive release still referenced by active nginx configuration: ' + str(path))
    obsolete = [r for r in processes if any(
        str(r.get('pm2_env', {}).get('pm_cwd', '')).startswith(str(path) + '/') or
        str(r.get('pm2_env', {}).get('pm_exec_path', '')).startswith(str(path) + '/')
        for path in old)]
    print(json.dumps({'live': str(live), 'remove': [str(x) for x in old],
                      'stop_pm2': [r['name'] for r in obsolete], 'apply': a.apply}), flush=True)
    if not a.apply:
        return
    for row in obsolete:
        run(prefix + ['pm2', 'delete', str(row['pm_id'])], env=env, stdout=subprocess.DEVNULL)
    run(prefix + ['pm2', 'save'], env=env, stdout=subprocess.DEVNULL)
    # Fail closed for unmanaged workers/builds, open descriptors and mapped files.
    # Never kill an unrelated process based on a port or a substring in its command.
    for attempt in range(20):
        blockers = []
        for proc in Path('/proc').glob('[0-9]*'):
            try:
                refs = [os.readlink(str(proc / 'exe'))]
                command = (proc / 'cmdline').read_bytes().replace(b'\0', b' ').decode(errors='replace')
                # PM2 daemon's inherited cwd is not an app dependency. Its live
                # workers, descriptors and mappings are checked independently.
                if not (command.startswith('PM2 ') and 'God Daemon (' in command):
                    refs.append(os.readlink(str(proc / 'cwd')))
                for fd in (proc / 'fd').iterdir():
                    try:
                        refs.append(os.readlink(str(fd)))
                    except FileNotFoundError:
                        pass
                refs.append((proc / 'maps').read_text())
                if any(str(path) + '/' in ref or ref == str(path) for ref in refs for path in old):
                    blockers.append(proc.name)
            except (FileNotFoundError, ProcessLookupError):
                pass
        if not blockers:
            break
        time.sleep(1)
    if blockers:
        raise RuntimeError('Release files still held by processes: ' + ','.join(blockers))
    for path in old:
        if live_path() != live or path == live:
            raise RuntimeError('Live release changed during cleanup')
        shutil.rmtree(str(path))
    if a.source:
        run(prefix + ['git', '-c', 'safe.directory=' + a.source, '-C', a.source, 'worktree', 'prune'], env=env)
    for path in base.glob('build-*.log'):
        if path.is_file() and not path.is_symlink() and time.time() - path.stat().st_mtime > 7 * 86400:
            path.unlink()
    print('Kept only live release: ' + str(live))


if __name__ == '__main__':
    main()
