@echo off
echo 🎵 Praise Planner Pro - Git Auto-Update 🚀
echo.
echo 1. Staging changes...
git add .
echo.
echo 2. Committing changes (v0.0.7)...
git commit -m "Fix: YouTube playback in production and cleanup conflicts (v0.0.7)"
echo.
echo 3. Pushing to GitHub...
git push origin main
echo.
echo ✅ Actualización completada correctamente.
echo ⏳ Espera 2-3 minutos a que Easypanel termine el despliegue.
echo.
pause
