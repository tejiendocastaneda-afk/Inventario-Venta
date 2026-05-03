@echo off
title Tejidos Castaneda - Sistema de gestion

echo.
echo  Tejidos Castaneda - Sistema de gestion
echo  =========================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Node.js no esta instalado.
  echo  Descargalo en: https://nodejs.org
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js detectado: %NODE_VER%

:: Ir al directorio del backend
cd /d "%~dp0backend"

:: Instalar dependencias
if not exist "node_modules" (
  echo.
  echo  [INFO] Instalando dependencias...
  call npm install
  echo  [OK] Dependencias instaladas
) else (
  echo  [OK] Dependencias ya instaladas
)

:: Crear carpeta de datos
if not exist "..\data\backups" mkdir "..\data\backups"

echo.
echo  [INFO] Iniciando servidor...
echo.
echo  URL:      http://localhost:3000
echo  Usuario:  admin@tejidos.com
echo  Clave:    admin1234
echo.
echo  Presiona Ctrl+C para detener el servidor
echo.

node server.js
pause
