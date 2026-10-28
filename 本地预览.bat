@echo off
title HEILIGS PIER 本地预览服务器
cd /d "%~dp0"
echo.
echo   正在启动本地预览服务器，浏览器将自动打开网站...
echo   关闭本窗口即停止预览。
echo.
start "" "http://localhost:8010/"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0local-server.ps1" -Root "%~dp0" -Port 8010
pause