#!/bin/bash

# HabitMaster Edge Extension - GitHub Pages Deployment Script
# This script helps set up and deploy the extension to GitHub Pages

echo "🚀 HabitMaster Edge Extension - GitHub Pages Deployment"
echo "======================================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: This directory is not a git repository"
    echo "Please run this script from the root of your HabitMaster repository"
    exit 1
fi

# Check if GitHub Pages is enabled
echo "📋 Checking GitHub Pages configuration..."

# Get the remote URL
REMOTE_URL=$(git remote get-url origin)
if [ -z "$REMOTE_URL" ]; then
    echo "❌ Error: No remote origin found"
    echo "Please add a remote origin pointing to your GitHub repository"
    exit 1
fi

echo "✅ Remote origin: $REMOTE_URL"

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on the main branch (currently on: $CURRENT_BRANCH)"
    echo "The GitHub Actions workflow will only deploy from the main branch"
    read -p "Do you want to switch to main branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        echo "✅ Switched to main branch"
    fi
fi

echo ""
echo "📁 Files ready for deployment:"
echo "├── index.html (redirects to demo)"
echo "├── gh-pages.html (full demo page)"
echo "├── .github/workflows/deploy.yml (deployment workflow)"
echo "├── All extension files (popup.js, styles.css, etc.)"
echo ""

echo "🔧 Next steps to deploy:"
echo "1. Push your changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add GitHub Pages deployment'"
echo "   git push origin main"
echo ""
echo "2. Enable GitHub Pages in your repository:"
echo "   - Go to Settings → Pages"
echo "   - Set source to 'GitHub Actions'"
echo "   - The workflow will automatically deploy your extension"
echo ""
echo "3. Your extension will be available at:"
echo "   https://yourusername.github.io/HabitMaster/"
echo ""

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to commit these changes now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Add GitHub Pages deployment files"
        echo "✅ Changes committed"
        echo ""
        echo "🚀 Ready to push! Run: git push origin main"
    fi
else
    echo "✅ All changes are committed"
    echo "🚀 Ready to push! Run: git push origin main"
fi

echo ""
echo "📚 For detailed instructions, see: README-GITHUB-PAGES.md"
echo "�� Happy deploying!"
