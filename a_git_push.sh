#!/bin/bash

echo "🚀 Pulling latest changes from origin/development..."
git pull origin development

echo "📄 Git status before commit:"
git status

echo "📝 Staging all changes..."
git add .

echo "🔍 Git diff summary:"
git diff --cached --stat

# Check if there is anything to commit
if git diff --cached --quiet; then
  echo "🟡 No changes to commit. Exiting..."
  exit 0
fi

echo "✅ Committing with current date and time..."
git commit -m "Auto commit on $(date '+%Y-%m-%d %H:%M:%S')"

echo "🚀 Pushing to origin/development..."
git push origin development
