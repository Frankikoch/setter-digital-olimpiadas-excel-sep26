# Deploy Script for Excel Digital Setter AI to Netlify
# Run this in the project folder

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Excel Digital Setter AI - Deploy to Netlify" -ForegroundColor Cyan
Write-Host "Automated Setup Script" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Verify we're in the right folder
if (!(Test-Path "package.json")) {
    Write-Host "ERROR: Not in the project folder" -ForegroundColor Red
    Write-Host "Run this script in: C:\MiEntornoCode\projects\ExcelyFinanzas setter digital" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Project folder confirmed" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 1: Clean up old Git
# =====================================================
Write-Host "[1/5] Cleaning up old Git repository..." -ForegroundColor Cyan

if (Test-Path ".git") {
    Write-Host "      Removing .git folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "      [OK] .git removed" -ForegroundColor Green
} else {
    Write-Host "      [OK] No old .git found" -ForegroundColor Green
}

Write-Host ""

# =====================================================
# STEP 2: Configure Git
# =====================================================
Write-Host "[2/5] Configuring Git..." -ForegroundColor Cyan

git config --global user.email "francisco@excelyfinanzas.com"
git config --global user.name "Francisco - ExcelyFinanzas"
Write-Host "      [OK] Git configured" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 3: Initialize new repo
# =====================================================
Write-Host "[3/5] Initializing Git repository..." -ForegroundColor Cyan

git init
Write-Host "      [OK] Repository initialized" -ForegroundColor Green

git add .
Write-Host "      [OK] Files added" -ForegroundColor Green

git commit -m "Initial commit: Excel Digital Setter AI with Pack Elite + IA Aplicada for OLIMPIADAS EXCEL campaign"
git branch -M main
Write-Host "      [OK] Initial commit done (branch: main)" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 4: Connect to GitHub
# =====================================================
Write-Host "[4/5] Connecting to GitHub..." -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: You need to create a repository on GitHub first" -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps to create GitHub repo:" -ForegroundColor White
Write-Host "1. Go to https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: excel-digital-setter-ai" -ForegroundColor White
Write-Host "3. Visibility: Public" -ForegroundColor White
Write-Host "4. Do NOT check 'Initialize this repository with...'" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$githubUser = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($githubUser)) {
    Write-Host ""
    Write-Host "ERROR: GitHub username required" -ForegroundColor Red
    exit 1
}

$repoName = "excel-digital-setter-ai"
$remoteUrl = "https://github.com/$githubUser/$repoName.git"

Write-Host ""
Write-Host "After creating the repo on GitHub, press ENTER to continue..." -ForegroundColor Cyan
Read-Host

git remote add origin $remoteUrl
Write-Host "[OK] Remote added: $remoteUrl" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 5: Push to GitHub
# =====================================================
Write-Host "[5/5] Uploading code to GitHub..." -ForegroundColor Cyan
Write-Host "(May ask for authentication - follow the instructions)" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Code uploaded to GitHub" -ForegroundColor Green
} else {
    Write-Host "ERROR: Push failed - check the error above" -ForegroundColor Yellow
}

Write-Host ""

# =====================================================
# FINAL SUMMARY
# =====================================================
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "Git Setup Complete!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Step: Deploy to Netlify" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://netlify.com" -ForegroundColor White
Write-Host "2. Click: 'Add new site' -> 'Import an existing project'" -ForegroundColor White
Write-Host "3. Select: GitHub -> Authorize -> 'excel-digital-setter-ai'" -ForegroundColor White
Write-Host "4. Configure:" -ForegroundColor White
Write-Host "   - Build command: npm run build" -ForegroundColor White
Write-Host "   - Publish directory: dist" -ForegroundColor White
Write-Host "   - Click 'Advanced' -> 'New variable'" -ForegroundColor White
Write-Host "     Key: VITE_GEMINI_API_KEY" -ForegroundColor White
Write-Host "     Value: [Your Gemini API key]" -ForegroundColor White
Write-Host "5. Click: 'Deploy site'" -ForegroundColor White
Write-Host ""
Write-Host "Wait about 3 minutes for deployment to complete..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Your final URL will be:" -ForegroundColor Cyan
Write-Host "https://excel-digital-setter-ai.netlify.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub Repository:" -ForegroundColor Cyan
Write-Host "https://github.com/$githubUser/$repoName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Script completed! You can close this window." -ForegroundColor Green
Write-Host ""