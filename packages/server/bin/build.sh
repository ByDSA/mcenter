#!/bin/sh
set -e  # Exit on error

rm -rf build

echo "Transpiling with tsc ..."
tsc -p tsconfig-build.json && tsc-alias -p tsconfig-build.json

# Copy assets
echo "Copying assets ..."
cp "./src/core/mails/templates/styles.css" "./build/core/mails/templates/"

echo "Build completed successfully!"