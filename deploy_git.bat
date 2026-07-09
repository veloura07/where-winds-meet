@echo off
echo ===================================================
echo 🍥 Sreeshanth Portfolio Git Deployer
echo ===================================================
echo.
cd /d "c:\Users\namir\OneDrive\Documents\where winds meet\where-winds-meet"

echo Initializing Git repository...
git init

echo Adding remote origin repository...
git remote remove origin 2>nul
git remote add origin https://github.com/veloura07/where-winds-meet.git

echo Staging all project files...
git add .

echo Committing files...
git commit -m "Evolve digital universe: procedural seasons, climate barometer HUD, wet bridge overlays, rainbow animations, and mascot spark cursor trail"

echo Renaming main branch...
git branch -M main

echo.
echo ===================================================
echo READY TO PUSH!
echo This will push your portfolio code to:
echo https://github.com/veloura07/where-winds-meet.git
echo ===================================================
echo.
git push -u origin main

echo.
echo Process complete! Check your repository at:
echo https://github.com/veloura07/where-winds-meet
echo.
pause
