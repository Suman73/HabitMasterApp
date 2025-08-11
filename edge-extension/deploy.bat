@echo off
REM HabitMaster Edge Extension - GitHub Pages Deployment Script
REM This script helps set up and deploy the extension to GitHub Pages

echo 🚀 HabitMaster Edge Extension - GitHub Pages Deployment
echo ======================================================

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Error: This directory is not a git repository
    echo Please run this script from the root of your HabitMaster repository
    pause
    exit /b 1
)

REM Check if GitHub Pages is enabled
echo 📋 Checking GitHub Pages configuration...

REM Get the remote URL
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set REMOTE_URL=%%i
if "%REMOTE_URL%"=="" (
    echo ❌ Error: No remote origin found
    echo Please add a remote origin pointing to your GitHub repository
    pause
    exit /b 1
)

echo ✅ Remote origin: %REMOTE_URL%

REM Check if we're on the main branch
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" (
    echo ⚠️  Warning: You're not on the main branch (currently on: %CURRENT_BRANCH%)
    echo The GitHub Actions workflow will only deploy from the main branch
    set /p SWITCH_BRANCH="Do you want to switch to main branch? (y/n): "
    if /i "%SWITCH_BRANCH%"=="y" (
        git checkout main
        echo ✅ Switched to main branch
    )
)

echo.
echo 📁 Files ready for deployment:
echo ├── index.html (redirects to demo)
echo ├── gh-pages.html (full demo page)
echo ├── .github/workflows/deploy.yml (deployment workflow)
echo ├── All extension files (popup.js, styles.css, etc.)
echo.

echo 🔧 Next steps to deploy:
echo 1. Push your changes to GitHub:
echo    git add .
echo    git commit -m "Add GitHub Pages deployment"
echo    git push origin main
echo.
echo 2. Enable GitHub Pages in your repository:
echo    - Go to Settings → Pages
echo    - Set source to 'GitHub Actions'
echo    - The workflow will automatically deploy your extension
echo.
echo 3. Your extension will be available at:
echo    https://yourusername.github.io/HabitMaster/
echo.

REM Check if there are uncommitted changes
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  You have uncommitted changes:
    git status --short
    echo.
    set /p COMMIT_CHANGES="Do you want to commit these changes now? (y/n): "
    if /i "%COMMIT_CHANGES%"=="y" (
        git add .
        git commit -m "Add GitHub Pages deployment files"
        echo ✅ Changes committed
        echo.
        echo 🚀 Ready to push! Run: git push origin main
    )
) else (
    echo ✅ All changes are committed
    echo 🚀 Ready to push! Run: git push origin main
)

echo.
echo 📚 For detailed instructions, see: README-GITHUB-PAGES.md
echo 🎉 Happy deploying!
pause
