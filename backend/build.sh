#!/usr/bin/env bash
# Render build script — installs deps, collects static files, migrates.
# Fails immediately on the first error (set -e).
set -euo pipefail

cd backend

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput
