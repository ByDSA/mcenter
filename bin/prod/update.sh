#!/bin/bash
set -e

git pull

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

cd "$DIR"/../..

pnpm i

cd shared
pnpm build

cd ../front
pnpm build

cd ../server
pnpm build
