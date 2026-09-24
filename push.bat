@echo off
echo ========================================================
echo   Git Push Script for POS Project (Backend + Frontend + Root)
echo ========================================================

echo.
echo [1/3] Commit and Push submodule Backend...
cd backend
if exist api rmdir /s /q api
git add -A
git commit -m "fix: use native Vercel Go preset and non-blocking startup on PORT"
git push origin HEAD
cd ..

echo.
echo [2/3] Commit and Push submodule Frontend...
cd frontend
git add -A
git commit -m "feat: table session settlement, combined orders checkout, and vercel config"
git push origin HEAD
cd ..

echo.
echo [3/3] Commit and Push Root Project...
git add -A
git commit -m "feat: update backend and frontend submodules for deployment"
git push origin HEAD

echo.
echo ========================================================
echo   Done! Semua perubahan berhasil di-push.
echo ========================================================
pause
