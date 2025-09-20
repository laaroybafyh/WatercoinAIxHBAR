# WATERCOIN HEDERA POS - Android APK Instructions

## Prerequisites
- Android Studio installed
- Samsung Tab8 in developer mode
- Domain hosting ready

## Steps to create APK:

### 1. Open Android Studio
- File → New → New Project
- Select "Phone and Tablet" → "Empty Activity"
- Name: Watercoin HEDERA POS
- Package: com.watercoin.hederapos
- Language: Java
- Minimum SDK: API 21

### 2. Setup Trusted Web Activity
- Add dependency in build.gradle:
  implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'

### 3. Replace AndroidManifest.xml
- Use AndroidManifest.xml file from this folder
- Replace "your-domain.com" with your hosting domain

### 4. Configure for Samsung Tab8
- res/values/styles.xml:
  <style name="Theme.WatercoinHEDERA" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="colorPrimary">#0D6CA3</item>
    <item name="android:screenOrientation">landscape</item>
  </style>

### 5. Build APK
- Build → Generate Signed Bundle/APK
- Select APK
- Create new keystore for production
- Build release APK

### 6. Install on Samsung Tab8
- Enable Developer Options on Tab8
- Enable USB Debugging
- Connect Tab8 to computer
- adb install app-release.apk

### 7. Testing
- Open application on Tab8
- Test in landscape mode (1200x1920)
- Verify POS flow with HEDERA payment
- Test QR scanning with HEDERA wallet

## Optimizations for Samsung Tab8

- Use landscape orientation
- Touch targets minimum 44dp
- Test with finger navigation
- Optimize for tablet screen size

## Production Deployment

- Upload APK to Google Play Console (internal testing)
- Setup proper app signing
- Configure domain verification
- Test with real users

## Troubleshooting

- If TWA doesn't load: Check domain SSL certificate
- If payment fails: Verify HEDERA TestNet connection
- If UI issues: Check responsive CSS for tablet

Contact: Watercoin Development Team
