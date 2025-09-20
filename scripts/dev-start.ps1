# WATERCOIN HEDERA POS - Simple Development Start
# Quick start script untuk development

Write-Host "🌊 WATERCOIN HEDERA POS - Quick Start" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$rootPath = "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR"
$frontendPath = Join-Path $rootPath "frontend"
$serverPath = Join-Path $rootPath "server"

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "🔧 Cleaning port $Port..." -ForegroundColor Yellow
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
        Write-Host "   ℹ️  Port $Port is clean" -ForegroundColor Gray
    }
}

# Clean ports
Stop-ProcessOnPort 3000
Stop-ProcessOnPort 4000

Write-Host "🚀 Starting servers..." -ForegroundColor Cyan

# Start backend server in new window
Write-Host "   🔧 Starting backend server (port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; Write-Host 'BACKEND SERVER - WATERCOIN HEDERA' -ForegroundColor Green; npm run dev" -WindowStyle Normal

# Wait 3 seconds for backend to start
Start-Sleep -Seconds 3

# Start frontend server in new window
Write-Host "   🌐 Starting frontend server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'FRONTEND SERVER - WATERCOIN HEDERA' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# Wait 3 seconds for frontend to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 SERVERS STARTED!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🏪 POS System: http://localhost:3000/pos" -ForegroundColor Yellow
Write-Host "🔧 Backend API: http://localhost:4000" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Testing Instructions:" -ForegroundColor Yellow
Write-Host "   1. Buka browser ke: http://localhost:3000/pos" -ForegroundColor White
Write-Host "   2. Click produk: AIR RO 19L (Rp 6.000 ~ 2.00 HBAR)" -ForegroundColor White
Write-Host "   3. Click: 'Pay with HEDERA'" -ForegroundColor White
Write-Host "   4. Scan QR dengan HEDERA wallet" -ForegroundColor White
Write-Host "   5. Verify payment di blockchain" -ForegroundColor White
Write-Host ""
Write-Host "📊 Product Prices:" -ForegroundColor Cyan
Write-Host "   • AIR RO 19L: Rp 6.000 ~ 2.00 HBAR" -ForegroundColor White
Write-Host "   • GALON AQUA: Rp 20.000 ~ 6.67 HBAR" -ForegroundColor White
Write-Host "   • GALON CLEO: Rp 18.000 ~ 6.00 HBAR" -ForegroundColor White
Write-Host "   • GALON PERTAMA: Rp 65.000 ~ 21.67 HBAR" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Untuk stop servers: Tutup kedua window PowerShell yang terbuka" -ForegroundColor Red

Set-Location $rootPath
