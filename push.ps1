# ==========================================
# Git Push Script for POS Project (Backend + Frontend + Root)
# ==========================================

Write-Host "🚀 [1/3] Melakukan Commit & Push pada Submodule Backend..." -ForegroundColor Cyan
Set-Location backend
git add .
git commit -m "feat: add vercel serverless entrypoint and configuration"
git push origin main

Write-Host "`n🚀 [2/3] Melakukan Commit & Push pada Submodule Frontend..." -ForegroundColor Cyan
Set-Location ../frontend
git add .
git commit -m "feat: table session settlement, combined orders checkout, and vercel config"
git push origin main

Write-Host "`n🚀 [3/3] Melakukan Commit & Push pada Root Project..." -ForegroundColor Cyan
Set-Location ..
git add .
git commit -m "feat: update backend and frontend submodules for deployment"
git push origin master

Write-Host "`n✅ Semua perubahan (Backend, Frontend, & Root) berhasil di-push ke GitHub!" -ForegroundColor Green

