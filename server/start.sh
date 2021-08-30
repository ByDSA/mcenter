#!/bin/sh
set -e

[ ! -d dist ] && npm run build
node dist/index.js
