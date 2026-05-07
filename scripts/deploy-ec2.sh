#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/devradar}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
PNPM_VERSION="${PNPM_VERSION:-10.11.0}"

cd "$APP_DIR"

echo "[deploy] app_dir=$APP_DIR branch=$DEPLOY_BRANCH"

git fetch origin "$DEPLOY_BRANCH" --prune
git checkout "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate
corepack pnpm install --frozen-lockfile
corepack pnpm prisma:generate
corepack pnpm prisma:deploy
corepack pnpm build

pm2 delete devradar-api >/dev/null 2>&1 || true
pm2 delete devradar-worker >/dev/null 2>&1 || true
pm2 start "corepack pnpm start:api" --name devradar-api
pm2 start "corepack pnpm start:worker" --name devradar-worker
pm2 save

echo "[deploy] complete"
