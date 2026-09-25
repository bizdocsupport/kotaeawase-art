@echo off
chcp 65001 > nul
cd /d "%~dp0"
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py -3 tools\apply_social_card.py
) else (
    python tools\apply_social_card.py
)
echo.
pause
