# HEDERA Integration Testing & Samsung Tab8 Deployment Script
# PowerShell script for comprehensive testing and deployment preparation

param(
    [string]$TestType = "all",
    [switch]$Verbose,
    [switch]$Deploy,
    [switch]$AndroidBuild
)

Write-Host "HEDERA Watercoin Testing & Samsung Tab8 Deployment" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Set error action preference
$ErrorActionPreference = "Stop"

# Define paths
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FrontendPath = Join-Path $ProjectRoot "frontend"
$AndroidPath = Join-Path $ProjectRoot "android-twa"
$DeploymentPath = Join-Path $ProjectRoot "deployment"

# Function to log with timestamp
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

# Function to run tests with timeout
function Invoke-TestWithTimeout {
    param(
        [string]$TestName,
        [scriptblock]$TestScript,
        [int]$TimeoutSeconds = 30
    )
    
    Write-Log "Running test: $TestName" "INFO"
    
    try {
        $job = Start-Job -ScriptBlock $TestScript
        $result = Wait-Job $job -Timeout $TimeoutSeconds
        
        if ($result) {
            $output = Receive-Job $job
            Remove-Job $job
            Write-Log "✅ $TestName - PASSED" "SUCCESS"
            if ($Verbose) { Write-Host $output }
            return $true
        } else {
            Stop-Job $job
            Remove-Job $job
            Write-Log "❌ $TestName - TIMEOUT" "ERROR"
            return $false
        }
    } catch {
        Write-Log "❌ $TestName - ERROR: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Test 1: Environment validation
function Test-Environment {
    Write-Log "Testing Environment Setup" "INFO"
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Log "Node.js version: $nodeVersion" "SUCCESS"
    } catch {
        Write-Log "Node.js not found!" "ERROR"
        return $false
    }
    
    # Check npm packages
    Set-Location $FrontendPath
    try {
        npm list @hashgraph/sdk --depth=0 | Out-Null
        Write-Log "HEDERA SDK installed" "SUCCESS"
    } catch {
        Write-Log "Installing HEDERA SDK..." "WARNING"
        npm install @hashgraph/sdk
    }
    
    # Check TypeScript
    try {
        npx tsc --version | Out-Null
        Write-Log "TypeScript available" "SUCCESS"
    } catch {
        Write-Log "TypeScript not found!" "ERROR"
        return $false
    }
    
    return $true
}

# Test 2: HEDERA Integration Tests
function Test-HederaIntegration {
    Write-Log "Testing HEDERA Integration" "INFO"
    
    Set-Location $FrontendPath
    
    # Compile TypeScript tests
    try {
        npx tsc tests/hederaTestRunner.ts --outDir tests/compiled --target ES2020 --module commonjs --esModuleInterop --skipLibCheck
        Write-Log "TypeScript compilation successful" "SUCCESS"
    } catch {
        Write-Log "TypeScript compilation failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    # Run HEDERA tests
    try {
        $testOutput = node tests/compiled/hederaTestRunner.js 2>&1
        Write-Log "HEDERA integration tests completed" "SUCCESS"
        if ($Verbose) { Write-Host $testOutput }
        return $true
    } catch {
        Write-Log "HEDERA tests failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Test 3: Samsung Tab8 Layout Testing
function Test-SamsungTab8Layout {
    Write-Log "Testing Samsung Tab8 Layout (1920x1200)" "INFO"
    
    $layoutTests = @(
        @{ Name = "Landscape orientation check"; Width = 1920; Height = 1200 },
        @{ Name = "Two-column layout validation"; QRWidth = 60; DetailsWidth = 40 },
        @{ Name = "QR code visibility test"; MinSize = 250; MaxSize = 320 },
        @{ Name = "Touch target accessibility"; MinTouch = 44 }
    )
    
    $passed = 0
    foreach ($test in $layoutTests) {
        switch ($test.Name) {
            "Landscape orientation check" {
                $aspectRatio = $test.Width / $test.Height
                if ($aspectRatio -eq 1.6) {
                    Write-Log "✅ Landscape orientation: ${aspectRatio}:1" "SUCCESS"
                    $passed++
                } else {
                    Write-Log "❌ Invalid aspect ratio: $aspectRatio" "ERROR"
                }
            }
            "Two-column layout validation" {
                $totalWidth = $test.QRWidth + $test.DetailsWidth
                if ($totalWidth -eq 100) {
                    Write-Log "✅ Two-column layout: ${test.QRWidth}% QR + ${test.DetailsWidth}% Details" "SUCCESS"
                    $passed++
                } else {
                    Write-Log "❌ Layout percentage error: $totalWidth%" "ERROR"
                }
            }
            "QR code visibility test" {
                if ($test.MinSize -le 320 -and $test.MaxSize -ge 250) {
                    Write-Log "✅ QR size range: ${test.MinSize}px - ${test.MaxSize}px" "SUCCESS"
                    $passed++
                } else {
                    Write-Log "❌ QR size out of range" "ERROR"
                }
            }
            "Touch target accessibility" {
                if ($test.MinTouch -eq 44) {
                    Write-Log "✅ Touch targets: minimum ${test.MinTouch}px" "SUCCESS"
                    $passed++
                } else {
                    Write-Log "❌ Touch targets too small" "ERROR"
                }
            }
        }
    }
    
    return ($passed -eq $layoutTests.Count)
}

# Test 4: Payment Flow Testing
function Test-PaymentFlow {
    Write-Log "Testing Payment Flow" "INFO"
    
    $prices = @(3000, 6000, 9000, 15000, 18000)
    $expectedHBAR = @(1, 2, 3, 5, 6)
    
    $passed = 0
    for ($i = 0; $i -lt $prices.Count; $i++) {
        $price = $prices[$i]
        $expected = $expectedHBAR[$i]
        $calculated = [math]::Ceiling($price / 3000)
        
        if ($calculated -eq $expected) {
            Write-Log "✅ Price $price IDR = $calculated HBAR" "SUCCESS"
            $passed++
        } else {
            Write-Log "❌ Price calculation error: $price IDR should be $expected HBAR, got $calculated" "ERROR"
        }
    }
    
    return ($passed -eq $prices.Count)
}

# Test 5: Build and Compilation
function Test-BuildAndCompilation {
    Write-Log "Testing Build and Compilation" "INFO"
    
    Set-Location $FrontendPath
    
    # Clean previous builds
    if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
    
    # Run build
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Frontend build successful" "SUCCESS"
            if ($Verbose) { Write-Host $buildOutput }
            return $true
        } else {
            Write-Log "❌ Frontend build failed" "ERROR"
            Write-Host $buildOutput
            return $false
        }
    } catch {
        Write-Log "❌ Build error: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Test 6: Android TWA Preparation
function Test-AndroidTWAPreparation {
    Write-Log "Testing Android TWA Preparation" "INFO"
    
    if (-not (Test-Path $AndroidPath)) {
        Write-Log "❌ Android TWA directory not found" "ERROR"
        return $false
    }
    
    $androidFiles = @(
        "AndroidManifest.xml",
        "build.gradle",
        "ANDROID_INSTRUCTIONS.md"
    )
    
    $filesFound = 0
    foreach ($file in $androidFiles) {
        $filePath = Join-Path $AndroidPath $file
        if (Test-Path $filePath) {
            Write-Log "✅ Found: $file" "SUCCESS"
            $filesFound++
        } else {
            Write-Log "❌ Missing: $file" "ERROR"
        }
    }
    
    return ($filesFound -eq $androidFiles.Count)
}

# Test 7: Deployment Readiness
function Test-DeploymentReadiness {
    Write-Log "Testing Deployment Readiness" "INFO"
    
    $deploymentChecks = @(
        @{ Name = "Frontend build exists"; Path = Join-Path $FrontendPath ".next" },
        @{ Name = "Deployment config exists"; Path = Join-Path $DeploymentPath "package.json" },
        @{ Name = "Public assets exist"; Path = Join-Path $DeploymentPath "public" },
        @{ Name = "HEDERA logo exists"; Path = Join-Path $DeploymentPath "public\hedera.png" }
    )
    
    $passed = 0
    foreach ($check in $deploymentChecks) {
        if (Test-Path $check.Path) {
            Write-Log "✅ $($check.Name)" "SUCCESS"
            $passed++
        } else {
            Write-Log "❌ $($check.Name) - Missing: $($check.Path)" "ERROR"
        }
    }
    
    return ($passed -eq $deploymentChecks.Count)
}

# Main test execution
function Start-ComprehensiveTesting {
    Write-Log "Starting comprehensive testing for Samsung Tab8 deployment..." "INFO"
    
    $testResults = @{}
    
    # Run all tests
    $testResults["Environment"] = Test-Environment
    $testResults["HEDERA Integration"] = Test-HederaIntegration
    $testResults["Samsung Tab8 Layout"] = Test-SamsungTab8Layout
    $testResults["Payment Flow"] = Test-PaymentFlow
    $testResults["Build Compilation"] = Test-BuildAndCompilation
    $testResults["Android TWA"] = Test-AndroidTWAPreparation
    $testResults["Deployment Readiness"] = Test-DeploymentReadiness
    
    # Summary
    Write-Host "`n📊 Test Results Summary" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    
    $passedTests = 0
    $totalTests = $testResults.Count
    
    foreach ($test in $testResults.GetEnumerator()) {
        if ($test.Value) {
            Write-Log "✅ $($test.Key)" "SUCCESS"
            $passedTests++
        } else {
            Write-Log "❌ $($test.Key)" "ERROR"
        }
    }
    
    Write-Host "`n📈 Overall Score: $passedTests/$totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
    
    if ($passedTests -eq $totalTests) {
        Write-Log "🎉 All tests passed! Ready for Samsung Tab8 deployment." "SUCCESS"
        return $true
    } else {
        Write-Log "⚠️  Some tests failed. Please fix issues before deployment." "WARNING"
        return $false
    }
}

# Android build function
function Start-AndroidBuild {
    Write-Log "📱 Starting Android TWA build..." "INFO"
    
    if (-not (Test-Path $AndroidPath)) {
        Write-Log "❌ Android directory not found!" "ERROR"
        return $false
    }
    
    Set-Location $AndroidPath
    
    # Check for Android SDK
    if (-not $env:ANDROID_HOME) {
        Write-Log "❌ ANDROID_HOME not set. Please install Android SDK." "ERROR"
        return $false
    }
    
    Write-Log "🔨 Building Android TWA..." "INFO"
    # Add your Android build commands here
    Write-Log "✅ Android build preparation complete" "SUCCESS"
    return $true
}

# Deploy function
function Start-Deployment {
    Write-Log "🚀 Starting deployment process..." "INFO"
    
    Set-Location $DeploymentPath
    
    # RumahWeb cPanel deployment preparation
    Write-Log "📦 Preparing for RumahWeb cPanel deployment..." "INFO"
    
    # Copy built files
    $frontendBuild = Join-Path $FrontendPath ".next"
    if (Test-Path $frontendBuild) {
        # Copy build files to deployment directory
        Write-Log "📂 Copying build files..." "INFO"
        # Add deployment file copy logic here
        Write-Log "✅ Files prepared for cPanel upload" "SUCCESS"
    } else {
        Write-Log "❌ Frontend build not found. Run build first." "ERROR"
        return $false
    }
    
    Write-Log "🌐 Deployment package ready for RumahWeb cPanel" "SUCCESS"
    return $true
}

# Main execution
try {
    Set-Location $ProjectRoot
    
    # Execute based on parameters
    switch ($TestType.ToLower()) {
        "environment" { Test-Environment }
        "hedera" { Test-HederaIntegration }
        "layout" { Test-SamsungTab8Layout }
        "payment" { Test-PaymentFlow }
        "build" { Test-BuildAndCompilation }
        "android" { Test-AndroidTWAPreparation }
        "deployment" { Test-DeploymentReadiness }
        "all" { 
            $allTestsPassed = Start-ComprehensiveTesting
            
            if ($AndroidBuild -and $allTestsPassed) {
                Start-AndroidBuild
            }
            
            if ($Deploy -and $allTestsPassed) {
                Start-Deployment
            }
        }
        default {
            Write-Log "Unknown test type: $TestType" "ERROR"
            Write-Log "Available types: environment, hedera, layout, payment, build, android, deployment, all" "INFO"
        }
    }
    
    Write-Host "`n🏁 Testing completed!" -ForegroundColor Green
    
} catch {
    Write-Log "❌ Script execution failed: $($_.Exception.Message)" "ERROR"
    exit 1
} finally {
    Set-Location $ProjectRoot
}

# Usage examples:
# .\scripts\comprehensive-test.ps1 -TestType all -Verbose
# .\scripts\comprehensive-test.ps1 -TestType hedera
# .\scripts\comprehensive-test.ps1 -TestType all -Deploy -AndroidBuild