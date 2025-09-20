# Watercoin HEDERA POS Testing Script
# This script performs comprehensive testing of the HEDERA integration and POS system

Write-Host "🚀 WATERCOIN HEDERA POS TESTING SCRIPT" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Function to check if a port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param($Port)
    Write-Host "🔍 Checking for processes on port $Port..." -ForegroundColor Yellow
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                    ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
        
        if ($processes) {
            foreach ($process in $processes) {
                Write-Host "⏹️  Stopping process: $($process.Name) (PID: $($process.Id))" -ForegroundColor Red
                Stop-Process -Id $process.Id -Force
            }
        } else {
            Write-Host "✅ Port $Port is free" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Could not check port $Port" -ForegroundColor Yellow
    }
}

# Step 1: Clean up existing processes
Write-Host "`n📋 STEP 1: CLEANING UP EXISTING PROCESSES" -ForegroundColor Cyan
Stop-ProcessOnPort 3000  # Frontend
Stop-ProcessOnPort 4000  # Backend

# Step 2: Navigate to project directory
Write-Host "`n📂 STEP 2: NAVIGATING TO PROJECT DIRECTORY" -ForegroundColor Cyan
$projectPath = "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "✅ Project directory found: $projectPath" -ForegroundColor Green
} else {
    Write-Host "❌ Project directory not found: $projectPath" -ForegroundColor Red
    exit 1
}

# Step 3: Test HEDERA integration
Write-Host "`n🧪 STEP 3: TESTING HEDERA INTEGRATION" -ForegroundColor Cyan
Set-Location "frontend"
Write-Host "Running HEDERA integration tests..." -ForegroundColor Yellow

# Run price display test
npx tsx tests/priceDisplay.test.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Price display test passed" -ForegroundColor Green
} else {
    Write-Host "❌ Price display test failed" -ForegroundColor Red
}

# Run POS flow test
npx tsx tests/posFlow.test.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ POS flow test passed" -ForegroundColor Green
} else {
    Write-Host "❌ POS flow test failed" -ForegroundColor Red
}

# Step 4: Start backend server
Write-Host "`n🖥️  STEP 4: STARTING BACKEND SERVER" -ForegroundColor Cyan
Set-Location "..\server"
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Starting backend server on port 4000..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR\server"
    npm run dev
}

# Wait for backend to start
Start-Sleep -Seconds 5
if (Test-Port 4000) {
    Write-Host "✅ Backend server started successfully on http://localhost:4000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server failed to start" -ForegroundColor Red
}

# Step 5: Start frontend development server
Write-Host "`n🌐 STEP 5: STARTING FRONTEND SERVER" -ForegroundColor Cyan
Set-Location "..\frontend"
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Starting frontend server on port 3000..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR\frontend"
    npm run dev
}

# Wait for frontend to start
Start-Sleep -Seconds 10
if (Test-Port 3000) {
    Write-Host "✅ Frontend server started successfully on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend server failed to start" -ForegroundColor Red
}

# Step 6: Display testing instructions
Write-Host "`n🎯 STEP 6: MANUAL TESTING INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor White
Write-Host "1. Open browser to: http://localhost:3000" -ForegroundColor Yellow
Write-Host "2. Navigate to POS: http://localhost:3000/pos" -ForegroundColor Yellow
Write-Host "3. Test the following flow:" -ForegroundColor Yellow
Write-Host "   - Click on 'AIR RO 19L' (Rp 6.000 ~ 2.00 HBAR)" -ForegroundColor White
Write-Host "   - Click 'BAYAR HEDERA' button" -ForegroundColor White
Write-Host "   - Verify QR code generation" -ForegroundColor White
Write-Host "   - Test wallet deep links (Petra, Martian, Pontem, Fewcha)" -ForegroundColor White
Write-Host "   - Monitor transaction status" -ForegroundColor White
Write-Host "4. Check sensor data integration at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "5. Verify HEDERA network storage of sensor data" -ForegroundColor Yellow

# Step 7: Display system status
Write-Host "`n📊 STEP 7: SYSTEM STATUS" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Green
Write-Host "POS Page: http://localhost:3000/pos" -ForegroundColor Green
Write-Host "HEDERA Network: Testnet" -ForegroundColor Green
Write-Host "Wallet Address: 0xb939d880b6e526f5296806b8984cb2f9ecc2d347ebef46bc74729460926b905c" -ForegroundColor Green

Write-Host "`n💡 TESTING TIPS:" -ForegroundColor Cyan
Write-Host "- Use Samsung Tab8 viewport (1200x1920) in browser dev tools" -ForegroundColor Yellow
Write-Host "- Test all payment flows with different products" -ForegroundColor Yellow
Write-Host "- Verify price conversions are accurate (2 decimal places)" -ForegroundColor Yellow
Write-Host "- Ensure QR codes generate correctly" -ForegroundColor Yellow
Write-Host "- Test wallet app deep linking" -ForegroundColor Yellow

Write-Host "`n⏹️  To stop servers, press Ctrl+C or run: Stop-Job -Job `$backendJob, `$frontendJob" -ForegroundColor Red

# Keep script running
Write-Host "`nPress any key to stop servers and exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host "`n🧹 CLEANING UP..." -ForegroundColor Cyan
Stop-Job -Job $backendJob, $frontendJob -Force
Remove-Job -Job $backendJob, $frontendJob -Force
Write-Host "✅ Cleanup completed" -ForegroundColor Green
