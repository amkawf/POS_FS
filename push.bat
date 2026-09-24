@echo off
echo ========================================================
echo   Git Push Script for POS Project (Backend + Frontend + Root)
echo ========================================================

echo.
echo [1/3] Commit and Push submodule Backend...
cd backend
git add .
git commit -m "feat: support Vercel PORT and serverless entrypoint"
git push origin HEAD
cd ..

echo.
echo [2/3] Commit and Push submodule Frontend...
cd frontend
git add .
git commit -m "feat: table session settlement, combined orders checkout, and vercel config"
git push origin HEAD
cd ..

echo.
echo [3/3] Commit and Push Root Project...
git add .
git commit -m "feat: update backend and frontend submodules for deployment"
git push origin HEAD

echo.
echo ========================================================
echo   Done! Semua perubahan berhasil di-push.
echo ========================================================
pause
