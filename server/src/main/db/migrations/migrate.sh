#!/bin/bash
if [ -z "$1" ]; then
  echo "Please provide a migration name"
  exit 1
fi
node -r ts-node/register -r tsconfig-paths/register ./src/main/db/migrations/"$1"/main.ts
