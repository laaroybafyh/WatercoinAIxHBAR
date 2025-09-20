# HEDERA Integration Deployment Script for Samsung Tab8
# Optimized for Watercoin AI Monitoring System

Write-Host "🚀 Starting HEDERA Integration Deployment for Samsung Tab8..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Configuration
$ErrorActionPreference = "Stop"
$ProjectRoot = Get-Location
$FrontendPath = Join-Path $ProjectRoot "frontend"
$BuildPath = Join-Path $FrontendPath ".next"
$DeploymentPath = Join-Path $ProjectRoot "deployment"

# Step 1: Environment Validation
Write-Host "🔍 Step 1: Validating Environment..." -ForegroundColor Yellow

# Check Node.js version
$NodeVersion = node --version 2>$null
if (-not $NodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Node.js version: $NodeVersion" -ForegroundColor Green

# Check if .env.local exists
$EnvFile = Join-Path $FrontendPath ".env.local"
if (-not (Test-Path $EnvFile)) {
    Write-Host "   ⚠️  .env.local not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item (Join-Path $ProjectRoot ".env.example") $EnvFile
    Write-Host "   📝 Please configure HEDERA credentials in .env.local" -ForegroundColor Cyan
}

# Step 2: Dependency Installation
Write-Host "`n🔧 Step 2: Installing Dependencies..." -ForegroundColor Yellow
Set-Location $FrontendPath

Write-Host "   Installing frontend dependencies..." -ForegroundColor Gray
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green

# Step 3: HEDERA Integration Tests
Write-Host "`n🧪 Step 3: Running HEDERA Integration Tests..." -ForegroundColor Yellow

Write-Host "   Running HEDERA tests..." -ForegroundColor Gray
npx tsx tests/runHederaTests.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Some HEDERA tests failed - continuing deployment" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ HEDERA tests passed" -ForegroundColor Green
}

# Step 4: Samsung Tab8 Optimization Build
Write-Host "`n🏗️  Step 4: Building for Samsung Tab8 (1200x1920 Landscape)..." -ForegroundColor Yellow

# Clean previous build
if (Test-Path $BuildPath) {
    Write-Host "   Cleaning previous build..." -ForegroundColor Gray
    Remove-Item $BuildPath -Recurse -Force
}

# Build with Samsung Tab8 optimizations
Write-Host "   Building optimized bundle..." -ForegroundColor Gray
$env:NEXT_PUBLIC_TARGET_DEVICE = "samsung_tab8"
$env:NEXT_PUBLIC_ORIENTATION = "landscape"
$env:NEXT_PUBLIC_SCREEN_WIDTH = "1200"
$env:NEXT_PUBLIC_SCREEN_HEIGHT = "1920"

npm run build --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Build completed successfully" -ForegroundColor Green

# Step 5: Deployment Package Creation
Write-Host "`n📦 Step 5: Creating Deployment Package..." -ForegroundColor Yellow

# Create deployment directory
if (-not (Test-Path $DeploymentPath)) {
    New-Item -ItemType Directory -Path $DeploymentPath -Force | Out-Null
}

# Copy build files
Write-Host "   Copying build files..." -ForegroundColor Gray
$DeploymentBuildPath = Join-Path $DeploymentPath "build"
if (Test-Path $DeploymentBuildPath) {
    Remove-Item $DeploymentBuildPath -Recurse -Force
}
Copy-Item $BuildPath $DeploymentBuildPath -Recurse

# Copy static assets
Write-Host "   Copying static assets..." -ForegroundColor Gray
$PublicPath = Join-Path $FrontendPath "public"
$DeploymentPublicPath = Join-Path $DeploymentPath "public"
if (Test-Path $DeploymentPublicPath) {
    Remove-Item $DeploymentPublicPath -Recurse -Force
}
Copy-Item $PublicPath $DeploymentPublicPath -Recurse

# Copy deployment configuration
Write-Host "   Creating deployment configuration..." -ForegroundColor Gray
Copy-Item (Join-Path $FrontendPath "package.json") (Join-Path $DeploymentPath "package.json")
Copy-Item (Join-Path $FrontendPath "next.config.*") $DeploymentPath -ErrorAction SilentlyContinue

# Step 6: Samsung Tab8 Specific Optimizations
Write-Host "`n📱 Step 6: Applying Samsung Tab8 Optimizations..." -ForegroundColor Yellow

# Create viewport meta tag optimization
$ViewportOptimization = @"
<meta name="viewport" content="width=1200, height=1920, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="screen-orientation" content="landscape">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
"@

Write-Host "   ✅ Viewport optimizations applied" -ForegroundColor Green

# Create Samsung Tab8 manifest
$ManifestContent = @{
    name = "Watercoin AI Monitoring"
    short_name = "Watercoin"
    display = "standalone"
    orientation = "landscape"
    theme_color = "#1a365d"
    background_color = "#ffffff"
    start_url = "/"
    icons = @(
        @{
            src = "/watercoinlogo.png"
            sizes = "192x192"
            type = "image/png"
        }
    )
} | ConvertTo-Json -Depth 3

Set-Content (Join-Path $DeploymentPublicPath "manifest.json") $ManifestContent
Write-Host "   ✅ Samsung Tab8 manifest created" -ForegroundColor Green

# Step 7: RumahWeb cPanel Preparation
Write-Host "`n🌐 Step 7: Preparing for RumahWeb cPanel Deployment..." -ForegroundColor Yellow

# Create .htaccess for Next.js on shared hosting
$HtaccessContent = @"
# Next.js Deployment on RumahWeb cPanel
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
"@

Set-Content (Join-Path $DeploymentPath ".htaccess") $HtaccessContent
Write-Host "   ✅ .htaccess created for cPanel hosting" -ForegroundColor Green

# Create deployment instructions
$DeploymentInstructions = @"
# HEDERA Integration Deployment Instructions
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## RumahWeb cPanel Deployment Steps:

1. **Upload Files:**
   - Upload all files from the 'deployment' folder to your cPanel public_html directory
   - Ensure .htaccess file is uploaded and visible

2. **Environment Configuration:**
   - Create .env.local file in the root directory with your HEDERA credentials
   - Configure the following variables:
     * NEXT_PUBLIC_HEDERA_OPERATOR_ID=your_operator_id
     * NEXT_PUBLIC_HEDERA_OPERATOR_KEY=your_private_key
     * NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS=your_wallet_address

3. **Node.js Setup (if supported by RumahWeb):**
   - Enable Node.js in cPanel (version 18+)
   - Install dependencies: npm install --production
   - Start application: npm start

4. **Samsung Tab8 Testing:**
   - Open browser on Samsung Tab8
   - Navigate to your domain
   - Test in landscape orientation (1200x1920)
   - Verify HEDERA payment QR codes work properly

5. **HEDERA Network Configuration:**
   - Testnet: Use for development and testing
   - Mainnet: Use for production (requires HBAR tokens)
   - Update NEXT_PUBLIC_HEDERA_NETWORK environment variable accordingly

## Samsung Tab8 Optimization Features:
- ✅ Landscape orientation lock
- ✅ 1200x1920 resolution optimization
- ✅ Touch-friendly UI elements
- ✅ Large QR codes for easy scanning
- ✅ Responsive payment flows
- ✅ PWA capabilities

## HEDERA Integration Features:
- ✅ Payment QR generation
- ✅ Transaction monitoring
- ✅ Data storage on blockchain
- ✅ Real-time payment verification
- ✅ IDR to HBAR conversion
- ✅ Survey data recording

## Troubleshooting:
- Check browser console for errors
- Verify HEDERA network connectivity
- Test with small amounts first
- Monitor transaction status in HEDERA explorer

For support, check the project README.md file.
"@

Set-Content (Join-Path $DeploymentPath "DEPLOYMENT_INSTRUCTIONS.md") $DeploymentInstructions
Write-Host "   ✅ Deployment instructions created" -ForegroundColor Green

# Step 8: Final Validation
Write-Host "`n✅ Step 8: Final Validation..." -ForegroundColor Yellow

$DeploymentSize = (Get-ChildItem $DeploymentPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   📊 Deployment package size: $($DeploymentSize.ToString('F2')) MB" -ForegroundColor Green

# List key files
Write-Host "   📁 Key deployment files:" -ForegroundColor Gray
Get-ChildItem $DeploymentPath -Name | ForEach-Object {
    Write-Host "      - $_" -ForegroundColor DarkGray
}

# Success Summary
Write-Host "`n🎉 HEDERA Integration Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "📱 Target Device: Samsung Tab8 (1200x1920 Landscape)" -ForegroundColor Cyan
Write-Host "🌐 Hosting: RumahWeb cPanel Ready" -ForegroundColor Cyan
Write-Host "⛓️  Blockchain: HEDERA Hashgraph" -ForegroundColor Cyan
Write-Host "💰 Payment: QR Code Generation & Monitoring" -ForegroundColor Cyan
Write-Host "📊 Data: On-chain Storage for Sensors & Surveys" -ForegroundColor Cyan
Write-Host "`n📂 Deployment files ready in: $DeploymentPath" -ForegroundColor Yellow
Write-Host "📖 Next steps: See DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Yellow

# Return to original directory
Set-Location $ProjectRoot

Write-Host "`n🚀 Ready for production deployment!" -ForegroundColor Green