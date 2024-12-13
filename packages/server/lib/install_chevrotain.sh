#!/bin/bash

# Instala la dependencia "chevrotain" para que sea compatible con CommonJS

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT
cd "$TEMP_DIR"

git clone https://github.com/Chevrotain/chevrotain
cd chevrotain

pnpm i
pnpm compile

cd packages/chevrotain
sed -i '/"bundle": "npm-run-all bundle:\*\*",/a \ \ \ \ "bundle:cjs:regular": "esbuild ./lib/src/api.js --bundle --sourcemap --format=cjs --outfile=lib/chevrotain.cjs",\n    "bundle:cjs:min": "esbuild ./lib/src/api.js --bundle --minify --format=cjs --sourcemap --outfile=lib/chevrotain.min.cjs",' package.json

pnpm bundle:cjs:regular
pnpm bundle:cjs:min

sed -i '/"import": ".\/lib\/src\/api.js",/a \ \ \ \ \ \ "require": ".\/lib\/chevrotain.cjs",' package.json

rm -rf benchmark_web node_modules scripts test tsconfig.json .c8rc.json .mocharc.cjs

cd $SCRIPT_DIR
rm -rf chevrotain
mv $TEMP_DIR/chevrotain/packages/chevrotain ./
