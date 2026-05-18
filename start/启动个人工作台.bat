@echo off
chcp 65001 >nul
echo 🚀 正在启动 个人工作台...
echo.

set "APP_DIR=%~dp0..\my-workspace\release\win-unpacked"
set "APP_EXE=%APP_DIR%\个人工作台.exe"

if exist "%APP_EXE%" (
    start "" "%APP_EXE%"
    echo ✅ 个人工作台 已启动
) else (
    echo ❌ 未找到 个人工作台.exe
    echo 请确认已运行 npm run dist 构建完成
    echo 路径: %APP_EXE%
)

echo.
echo 📁 或者直接双击运行安装程序：
echo    my-workspace\release\个人工作台 Setup 1.0.0.exe
pause
