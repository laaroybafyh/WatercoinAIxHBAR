# WATERCOIN HEDERA POS - Android Deployment Script
# Script untuk membuat APK Samsung Tab8 dan hosting setup

param(
    [switch]$BuildAPK,
    [switch]$HostingSetup,
    [switch]$All
)

Write-Host "📱 WATERCOIN HEDERA POS - Android Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$rootPath = "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR"
$frontendPath = Join-Path $rootPath "frontend"

if ($All) {
    $BuildAPK = $true
    $HostingSetup = $true
}

if ($HostingSetup -or $All) {
    Write-Host "🌐 Preparing hosting deployment..." -ForegroundColor Cyan
    
    Set-Location $frontendPath
    
    # Build for production
    Write-Host "   🔧 Building production version..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Production build successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Production build failed" -ForegroundColor Red
        exit 1
    }
    
    # Create deployment package
    $deployPath = Join-Path $rootPath "deployment"
    if (Test-Path $deployPath) {
        Remove-Item -Path $deployPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $deployPath -Force | Out-Null
    
    # Copy necessary files
    Write-Host "   📦 Creating deployment package..." -ForegroundColor Yellow
    
    Copy-Item -Path (Join-Path $frontendPath ".next") -Destination (Join-Path $deployPath ".next") -Recurse
    Copy-Item -Path (Join-Path $frontendPath "public") -Destination (Join-Path $deployPath "public") -Recurse
    Copy-Item -Path (Join-Path $frontendPath "package.json") -Destination $deployPath
    Copy-Item -Path (Join-Path $frontendPath "next.config.cjs") -Destination $deployPath
    
    # Create .env.production
    $envContent = @"
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS=0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5
NEXT_PUBLIC_HEDERA_MIRROR_NODE=https://testnet.mirrornode.hedera.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
PORT=3000
"@
    
    Set-Content -Path (Join-Path $deployPath ".env.production") -Value $envContent
    
    # Create deployment instructions
    $instructions = @"
# WATERCOIN HEDERA POS - Hosting Deployment Instructions

## RumahWeb cPanel Deployment

1. **Login ke RumahWeb cPanel**
2. **File Manager** → Navigate ke public_html
3. **Upload** semua file dari folder deployment ini
4. **Extract** jika dalam format ZIP
5. **Setup Node.js** (jika tersedia):
   - cd public_html
   - npm install --production
   - npm run start

## Environment Variables
File .env.production sudah disertakan dengan konfigurasi HEDERA Testnet.
Sesuaikan NEXT_PUBLIC_API_URL dengan domain hosting Anda.

## Domain Configuration
- Pastikan domain mengarah ke public_html
- Setup SSL certificate untuk HTTPS
- Test HEDERA payment di https://your-domain.com/pos

## Support
Jika ada masalah, hubungi support hosting untuk bantuan Node.js setup.
"@
    
    Set-Content -Path (Join-Path $deployPath "DEPLOYMENT_INSTRUCTIONS.md") -Value $instructions
    
    Write-Host "   ✅ Deployment package ready: $deployPath" -ForegroundColor Green
}

if ($BuildAPK -or $All) {
    Write-Host "📱 Creating Android APK configuration..." -ForegroundColor Cyan
    
    # Create Android Studio project configuration
    $androidPath = Join-Path $rootPath "android-twa"
    if (Test-Path $androidPath) {
        Remove-Item -Path $androidPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $androidPath -Force | Out-Null
    
    # Create TWA configuration files
    $manifestContent = @"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.watercoin.hederapos">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.WatercoinHEDERA"
        android:screenOrientation="landscape">
        
        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true"
            android:screenOrientation="landscape">
            
            <meta-data android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="https://your-domain.com/pos" />
                
            <meta-data android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />
                
            <meta-data android:name="android.support.customtabs.trusted.NAVIGATION_BAR_COLOR"
                android:resource="@color/colorPrimary" />
                
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https"
                    android:host="your-domain.com" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"@
    
    Set-Content -Path (Join-Path $androidPath "AndroidManifest.xml") -Value $manifestContent
    
    # Create build.gradle
    $buildGradleContent = @"
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.watercoin.hederapos"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
"@
    
    Set-Content -Path (Join-Path $androidPath "build.gradle") -Value $buildGradleContent
    
    # Create Android Studio instructions
    $androidInstructions = @"
# WATERCOIN HEDERA POS - Android APK Instructions

## Prerequisites
- Android Studio terinstall
- Samsung Tab8 dalam developer mode
- Domain hosting sudah siap

## Steps untuk membuat APK:

### 1. Buka Android Studio
- File → New → New Project
- Pilih "Phone and Tablet" → "Empty Activity"
- Name: Watercoin HEDERA POS
- Package: com.watercoin.hederapos
- Language: Java
- Minimum SDK: API 21

### 2. Setup Trusted Web Activity
- Tambahkan dependency di build.gradle:
  implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'

### 3. Replace AndroidManifest.xml
- Gunakan file AndroidManifest.xml yang ada di folder ini
- Ganti "your-domain.com" dengan domain hosting Anda

### 4. Configure untuk Samsung Tab8
- res/values/styles.xml:
  <style name="Theme.WatercoinHEDERA" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="colorPrimary">#0D6CA3</item>
    <item name="android:screenOrientation">landscape</item>
  </style>

### 5. Build APK
- Build → Generate Signed Bundle/APK
- Pilih APK
- Create new keystore untuk production
- Build release APK

### 6. Install di Samsung Tab8
- Enable Developer Options di Tab8
- Enable USB Debugging
- Connect Tab8 ke komputer
- adb install app-release.apk

### 7. Testing
- Buka aplikasi di Tab8
- Test dalam landscape mode (1200x1920)
- Verify POS flow dengan HEDERA payment
- Test QR scanning dengan HEDERA wallet

## Optimizations untuk Samsung Tab8
- Gunakan landscape orientation
- Touch targets minimum 44dp
- Test dengan finger navigation
- Optimize untuk tablet screen size

## Production Deployment
- Upload APK ke Google Play Console (internal testing)
- Setup proper app signing
- Configure domain verification
- Test dengan real users

## Troubleshooting
- Jika TWA tidak load: Check domain SSL certificate
- Jika payment fail: Verify HEDERA Testnet connection
- Jika UI issues: Check responsive CSS untuk tablet

Contact: Watercoin Development Team
"@
    
    Set-Content -Path (Join-Path $androidPath "ANDROID_INSTRUCTIONS.md") -Value $androidInstructions
    
    Write-Host "   ✅ Android configuration ready: $androidPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT PREPARATION COMPLETE!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan

if ($HostingSetup -or $All) {
    Write-Host "🌐 Hosting Files Ready:" -ForegroundColor Cyan
    Write-Host "   📁 Location: $rootPath\deployment" -ForegroundColor White
    Write-Host "   📋 Instructions: DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor White
}

if ($BuildAPK -or $All) {
    Write-Host "📱 Android APK Config Ready:" -ForegroundColor Cyan
    Write-Host "   📁 Location: $rootPath\android-twa" -ForegroundColor White
    Write-Host "   📋 Instructions: ANDROID_INSTRUCTIONS.md" -ForegroundColor White
}

Write-Host ""
Write-Host "🔍 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Upload deployment files ke RumahWeb hosting" -ForegroundColor White
Write-Host "   2. Configure domain dan SSL" -ForegroundColor White
Write-Host "   3. Buat APK di Android Studio" -ForegroundColor White
Write-Host "   4. Test APK di Samsung Tab8" -ForegroundColor White
Write-Host "   5. Deploy production version" -ForegroundColor White

Set-Location $rootPath
