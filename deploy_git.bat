@echo off
echo ===================================================
echo 🍥 Sreeshanth Portfolio Git Deployer
echo ===================================================
echo.
cd /d "%~dp0"

echo Initializing Git repository...
git init

echo Adding remote origin repository...
git remote remove origin 2>nul
git remote add origin https://github.com/theninthfoundry/where-winds-meet.git

echo Staging all project files...
git add .

echo Running production checks...
npm run check
if errorlevel 1 (
    echo Checks failed. Fix errors before deploying.
    pause
    exit /b 1
)

echo Building static deployment artifact...
npm run build
if errorlevel 1 (
    echo Build failed. Fix errors before deploying.
    pause
    exit /b 1
)

echo Committing files...
git commit -m "Make Elysium deployable with production audit foundations"

echo Renaming main branch...
git branch -M main

echo.
echo ===================================================
echo READY TO PUSH!
echo This will push your portfolio code to:
echo https://github.com/theninthfoundry/where-winds-meet.git
echo ===================================================
echo.
git push -u origin main

echo.
echo Process complete! Check your repository at:
echo https://github.com/theninthfoundry/where-winds-meet
echo.
pause
