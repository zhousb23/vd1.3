@echo off
set "DIR=%~dp0..\my-workspace\release\win-unpacked"
if exist "%DIR%\个人工作台.exe" (
    start "" "%DIR%\个人工作台.exe"
) else (
    echo [ERROR] Not found: %DIR%\个人工作台.exe
    echo Please run: cd my-workspace ^&^& npm run dist
)
