@echo off
echo ===================================================
2>nul python --version >nul
if errorlevel 1 (
    echo Python is not detected in your PATH. Please install Python or copy the files manually.
    pause
    exit /b 1
)
echo Running sync script copy_all.py...
python copy_all.py
echo ===================================================
echo Sync completed.
pause
