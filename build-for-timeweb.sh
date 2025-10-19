#!/bin/bash
set -e
echo "Building Next.js application..."
npx next build
echo "Creating out directory..."
mkdir -p out
echo "Copying static files to out directory..."
cp -r .next/server/app/* out/ 2>/dev/null || true
cp -r public/* out/ 2>/dev/null || true
echo "Build and export completed successfully!"
ls -la out/
