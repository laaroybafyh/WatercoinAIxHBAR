# WATERCOIN HEDERA POS - Complete Development & Test Script
# Automated script untuk menjalankan dan test sistem secara lengkap

param(
    [switch]$Clean,
    [switch]$TestOnly,
    [switch]$SkipInstall
)

Write-Host "🌊 WATERCOIN HEDERA POS SYSTEM - Complete Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$rootPath = "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR"
$frontendPath = Join-Path $rootPath "frontend"
$serverPath = Join-Path $rootPath "server"

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "🔧 Stopping processes on port $Port..." -ForegroundColor Yellow
    
    try {
        $processes = netstat -ano | Select-String ":$Port\s"
        foreach ($process in $processes) {
            $processInfo = $process.ToString().Trim() -split '\s+'
            $processId = $processInfo[-1]
            if ($processId -match '^\d+$') {
                taskkill /PID $processId /F 2>$null
                Write-Host "   ✅ Killed process PID: $processId" -ForegroundColor Green
            }
        }
    }
    catch {
        Write-Host "   ℹ️  No processes found on port $Port" -ForegroundColor Gray
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$TimeoutSeconds = 30
    )
    
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "   ✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            Start-Sleep -Seconds 1
        }
    }
    
    Write-Host "   ❌ $ServiceName failed to start within $TimeoutSeconds seconds" -ForegroundColor Red
    return $false
}

# Clean up previous processes
Write-Host "🧹 Cleaning up previous processes..." -ForegroundColor Yellow
Stop-ProcessOnPort 3000  # Frontend
Stop-ProcessOnPort 4000  # Backend
Stop-ProcessOnPort 8080  # Alternative ports
Stop-ProcessOnPort 3001

# Navigate to project root
Set-Location $rootPath

if ($Clean) {
    Write-Host "🧹 Performing deep clean..." -ForegroundColor Yellow
    
    # Clean frontend
    if (Test-Path (Join-Path $frontendPath "node_modules")) {
        Remove-Item -Path (Join-Path $frontendPath "node_modules") -Recurse -Force
        Write-Host "   ✅ Cleaned frontend node_modules" -ForegroundColor Green
    }
    
    # Clean server
    if (Test-Path (Join-Path $serverPath "node_modules")) {
        Remove-Item -Path (Join-Path $serverPath "node_modules") -Recurse -Force
        Write-Host "   ✅ Cleaned server node_modules" -ForegroundColor Green
    }
    
    # Clean build artifacts
    $buildPaths = @(
        (Join-Path $frontendPath ".next"),
        (Join-Path $frontendPath "out"),
        (Join-Path $serverPath "dist")
    )
    
    foreach ($path in $buildPaths) {
        if (Test-Path $path) {
            Remove-Item -Path $path -Recurse -Force
            Write-Host "   ✅ Cleaned $path" -ForegroundColor Green
        }
    }
}

if (-not $TestOnly -and -not $SkipInstall) {
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    
    # Frontend dependencies
    Write-Host "   🔧 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Frontend dependency installation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
    
    # Server dependencies  
    Write-Host "   🔧 Installing server dependencies..." -ForegroundColor Yellow
    Set-Location $serverPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Server dependency installation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Server dependencies installed" -ForegroundColor Green
    
    Set-Location $rootPath
}

if (-not $TestOnly) {
    # Start backend server
    Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
    Set-Location $serverPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm run dev" -WindowStyle Normal
    
    # Wait for backend to be ready
    if (-not (Wait-ForService "http://localhost:4000/health" "Backend Server")) {
        Write-Host "❌ Backend server failed to start" -ForegroundColor Red
        exit 1
    }
    
    # Start frontend server
    Write-Host "🚀 Starting frontend server..." -ForegroundColor Cyan
    Set-Location $frontendPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
    
    # Wait for frontend to be ready
    if (-not (Wait-ForService "http://localhost:3000" "Frontend Server")) {
        Write-Host "❌ Frontend server failed to start" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🎉 Both servers are running successfully!" -ForegroundColor Green
    Write-Host "   🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   🌐 POS System: http://localhost:3000/pos" -ForegroundColor Cyan
    Write-Host "   🔧 Backend API: http://localhost:4000" -ForegroundColor Cyan
}

# Run tests
Write-Host "🧪 Running comprehensive tests..." -ForegroundColor Cyan
Set-Location $frontendPath

# Test 1: Price Display Test
Write-Host "   📊 Testing price display..." -ForegroundColor Yellow
npx tsx tests/priceDisplay.test.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Price display test passed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Price display test failed" -ForegroundColor Red
}

# Test 2: POS Flow Test
Write-Host "   🏪 Testing POS flow..." -ForegroundColor Yellow
npx tsx tests/posFlow.test.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ POS flow test passed" -ForegroundColor Green
} else {
    Write-Host "   ❌ POS flow test failed" -ForegroundColor Red
}

# Test 3: POS Flow Simulation
Write-Host "   🎮 Running POS flow simulation..." -ForegroundColor Yellow
npx tsx tests/posFlowSimulation.test.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ POS flow simulation passed" -ForegroundColor Green
} else {
    Write-Host "   ❌ POS flow simulation failed" -ForegroundColor Red
}

# Test 4: Final Verification
Write-Host "   ✅ Running final verification..." -ForegroundColor Yellow
npx tsx tests/finalVerification.test.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Final verification passed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Final verification failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "💡 Untuk testing manual:" -ForegroundColor Cyan
Write-Host "   1. Buka browser: http://localhost:3000/pos" -ForegroundColor White
Write-Host "   2. Click produk (AIR RO 19L - Rp 6.000 ~ 2.00 HBAR)" -ForegroundColor White
Write-Host "   3. Click 'Pay with HEDERA'" -ForegroundColor White
Write-Host "   4. Scan QR dengan HEDERA wallet" -ForegroundColor White
Write-Host "   5. Verify transaksi di blockchain" -ForegroundColor White
Write-Host ""
Write-Host "📱 Untuk Samsung Tab8:" -ForegroundColor Cyan
Write-Host "   - Gunakan landscape mode (1200x1920)" -ForegroundColor White
Write-Host "   - Test touch targets dan responsiveness" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Untuk stop servers: Tutup windows PowerShell yang terbuka" -ForegroundColor Yellow

Set-Location $rootPath
