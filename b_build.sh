#!/bin/bash

echo "🧹 Cleaning project..."
rm -rf node_modules package-lock.json .next dist out

echo "📦 Reinstalling packages..."
npm install

echo "🏗️  Rebuilding project..."
npm run build

echo "✅ Done."