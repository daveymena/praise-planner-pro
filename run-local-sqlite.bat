@echo off
echo 🚀 Iniciando Praise Planner Pro con SQLite local...
echo.

echo 📦 Instalando dependencias del servidor...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del servidor
    pause
    exit /b 1
)

echo.
echo 🗄️ Iniciando servidor con SQLite...
start "Backend SQLite" cmd /k "node server-sqlite.js"

echo.
echo ⏳ Esperando 5 segundos para que inicie el servidor...
timeout /t 5 /nobreak > nul

cd ..

echo.
echo 🧪 Probando conexión API...
node test-api.js

echo.
echo 🌐 Iniciando frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Aplicación iniciada!
echo.
echo 📡 Backend (SQLite): http://localhost:3003
echo 🌐 Frontend: http://localhost:8080
echo 🔍 Health Check: http://localhost:3003/health
echo 🧪 API Test: node test-api.js
echo.
echo 📋 Para EasyPanel, sigue la guía en EASYPANEL_SETUP.md
echo.
echo Presiona cualquier tecla para continuar...
pause > nul