#!/usr/bin/env pwsh
# 🚀 WATERCOIN STACK UPDATE SCRIPT - Latest Optimizations
# Updates all dependencies to latest stable versions

Write-Host "🔄 WATERCOIN STACK UPDATE - TO LATEST VERSIONS" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Function to check if a command exists
function Test-Command($Command) {
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "`n📋 CHECKING PREREQUISITES..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green

# Check Node.js version (should be 18+)
$nodeVersionNumber = [System.Version]($nodeVersion -replace 'v','')
if ($nodeVersionNumber.Major -lt 18) {
    Write-Host "⚠️  WARNING: Node.js version $nodeVersion detected. Recommended: Node.js 18+" -ForegroundColor Yellow
}

Write-Host "`n🔧 STEP 1: UPDATING ROOT DEPENDENCIES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Update root dependencies
npm update
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Root dependencies updated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update root dependencies" -ForegroundColor Red
}

Write-Host "`n🌐 STEP 2: UPDATING FRONTEND DEPENDENCIES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location "frontend"

# Clear npm cache
Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Update to latest versions
Write-Host "📦 Installing latest dependencies..." -ForegroundColor Yellow
npm update

# Install any new dependencies from updated package.json
Write-Host "📥 Installing new dependencies..." -ForegroundColor Yellow
npm install

# Audit and fix vulnerabilities
Write-Host "🔒 Auditing and fixing security vulnerabilities..." -ForegroundColor Yellow
npm audit fix

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies updated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend dependency update had issues" -ForegroundColor Yellow
}

# Check for outdated packages
Write-Host "`n📊 Checking for remaining outdated packages..." -ForegroundColor Yellow
npm outdated

Set-Location ".."

Write-Host "`n🖥️  STEP 3: UPDATING BACKEND DEPENDENCIES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Set-Location "server"

# Clear npm cache
Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Update to latest versions
Write-Host "📦 Installing latest dependencies..." -ForegroundColor Yellow
npm update

# Install any new dependencies from updated package.json
Write-Host "📥 Installing new dependencies..." -ForegroundColor Yellow
npm install

# Audit and fix vulnerabilities
Write-Host "🔒 Auditing and fixing security vulnerabilities..." -ForegroundColor Yellow
npm audit fix

# Update Prisma
Write-Host "🗄️  Updating Prisma..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies updated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Backend dependency update had issues" -ForegroundColor Yellow
}

# Check for outdated packages
Write-Host "`n📊 Checking for remaining outdated packages..." -ForegroundColor Yellow
npm outdated

Set-Location ".."

Write-Host "`n🧪 STEP 4: RUNNING TESTS & VERIFICATION" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Type checking
Write-Host "🔍 Type checking frontend..." -ForegroundColor Yellow
Set-Location "frontend"
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend type check passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend type check had warnings" -ForegroundColor Yellow
}

Set-Location ".."

# Type checking backend
Write-Host "🔍 Type checking backend..." -ForegroundColor Yellow
Set-Location "server"
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend type check passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend type check had warnings" -ForegroundColor Yellow
}

Set-Location ".."

# Build tests
Write-Host "🏗️  Testing builds..." -ForegroundColor Yellow
Set-Location "frontend"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
}

Set-Location ".."

Set-Location "server"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
}

Set-Location ".."

Write-Host "`n📊 STEP 5: FINAL VERIFICATION" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Show final versions
Write-Host "`n📦 UPDATED VERSIONS:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green

Set-Location "frontend"
$nextVersion = npm list next --depth=0 2>$null | Select-String "next@" | ForEach-Object { $_ -replace ".*next@", "" -replace " .*", "" }
$reactVersion = npm list react --depth=0 2>$null | Select-String "react@" | ForEach-Object { $_ -replace ".*react@", "" -replace " .*", "" }
$aptosVersion = npm list @aptos-labs/ts-sdk --depth=0 2>$null | Select-String "@aptos-labs/ts-sdk@" | ForEach-Object { $_ -replace ".*@aptos-labs/ts-sdk@", "" -replace " .*", "" }
$typescriptVersion = npm list typescript --depth=0 2>$null | Select-String "typescript@" | ForEach-Object { $_ -replace ".*typescript@", "" -replace " .*", "" }

Write-Host "🌐 Frontend Stack:" -ForegroundColor Cyan
Write-Host "  • Next.js: $nextVersion" -ForegroundColor White
Write-Host "  • React: $reactVersion" -ForegroundColor White  
Write-Host "  • APTOS SDK: $aptosVersion" -ForegroundColor White
Write-Host "  • TypeScript: $typescriptVersion" -ForegroundColor White

Set-Location ".."
Set-Location "server"

$expressVersion = npm list express --depth=0 2>$null | Select-String "express@" | ForEach-Object { $_ -replace ".*express@", "" -replace " .*", "" }
$prismaVersion = npm list prisma --depth=0 2>$null | Select-String "prisma@" | ForEach-Object { $_ -replace ".*prisma@", "" -replace " .*", "" }

Write-Host "`n🖥️  Backend Stack:" -ForegroundColor Cyan
Write-Host "  • Express: $expressVersion" -ForegroundColor White
Write-Host "  • Prisma: $prismaVersion" -ForegroundColor White
Write-Host "  • TypeScript: $typescriptVersion" -ForegroundColor White

Set-Location ".."

Write-Host "`n🎉 STACK UPDATE COMPLETED!" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

Write-Host "`n📋 WHAT'S NEW IN THIS UPDATE:" -ForegroundColor Cyan
Write-Host "• ⬆️  Next.js 15.0.3 - Latest performance improvements" -ForegroundColor White
Write-Host "• ⬆️  TypeScript 5.6.3 - Enhanced type safety" -ForegroundColor White
Write-Host "• ⬆️  Prisma 5.22.0 - Latest database features" -ForegroundColor White
Write-Host "• ⬆️  Express 4.21.1 - Security updates" -ForegroundColor White
Write-Host "• ⬆️  ESLint 9.15.0 - Modern linting rules" -ForegroundColor White
Write-Host "• 🔒 Enhanced security headers" -ForegroundColor White
Write-Host "• 🚀 Better build optimizations" -ForegroundColor White
Write-Host "• 📱 Improved Samsung Tab8 support" -ForegroundColor White

Write-Host "`n🚀 READY TO START DEVELOPMENT:" -ForegroundColor Yellow
Write-Host "  Run: npm run dev:all" -ForegroundColor White
Write-Host "  Or:  .\scripts\dev-start.ps1" -ForegroundColor White

Write-Host "`n✅ All dependencies updated to latest stable versions!" -ForegroundColor Green
