#!/usr/bin/env bash
# Run only after candidate build, route switch, API and public health succeed.
set -euo pipefail
cd "$(dirname "$0")"
python3 keep-live.py --base /home/ugn/reklam-releases --user ugn --live-process reklam-frontend --health-url https://reklam.biz/ --apply
