
# 🌊 WATERCOIN AI MONITOR - HEDERA BLOCKCHAIN ECOSYSTEM

**Watercoin AI Monitor** is an integrated water quality monitoring system using **HEDERA Hashgraph** for fast, efficient payments, and immutable sensor data storage using **HEDERA Consensus Service (HCS)**.

## 🏗️ HEDERA Architecture

### 🔹 HEDERA Hashgraph (Payments & Data Storage)

- ⚡ **Ultra-fast Payments** - Confirmation in 3-5 seconds
- 🌱 **Energy Efficient** - 99.99% more energy efficient than Bitcoin
- 💰 **Low Cost** - Transaction fees only $0.0001
- 🔒 **Enterprise Security** - Asynchronous Byzantine Fault Tolerance (aBFT)
- 📚 **HCS Data Storage** - Sensor data stored immutable in HEDERA Consensus Service
- ✅ **Validation System** - Real-time validation with HEDERA smart contracts
- 🌐 **Public Transparency** - Public dashboard for data audit via HEDERA Mirror Node

## 🎯 Key Features

### 💳 POS & Payment System

- ✅ **HEDERA POS Integration** - QR payment with auto-conversion IDR↔HBAR
- ✅ **Samsung Tab8 Optimized** - Perfect landscape layout 1920x1200
- ✅ **Real-time Price Display** - Live HEDERA rates with high accuracy
- ✅ **Multi-wallet Support** - HashPack, Blade, Kabila, Yamgo

### 🔬 Sensor Data Management  

- ✅ **HEDERA HCS Storage** - WatercoinSensorData stored immutable in HEDERA Consensus Service
- ✅ **Real-time Validation** - HEDERA-based validation pipeline with blockchain proof
- ✅ **Mirror Node API** - Public access to validated sensor data via HEDERA Mirror Node
- ✅ **Live Monitoring** - Real-time sensor readings with HEDERA HCS backup

### 🎨 User Interface

- ✅ **HEDERA Dashboard** - Real-time HCS stats and data search via Mirror Node
- ✅ **Transparency Portal** - Public access to validated sensor data from HEDERA HCS
- ✅ **Mobile-First Design** - Responsive for all device sizes
- ✅ **Multi-language Support** - Indonesian & English

### 🔧 Developer Experience

- ✅ **Complete Testing Suite** - Unit tests for all HEDERA integrations
- ✅ **Automated Deployment** - PowerShell scripts for easy HEDERA deployment
- ✅ **Type Safety** - Full TypeScript with comprehensive HEDERA type definitions
- ✅ **Documentation** - Detailed HEDERA API docs and integration guides

## 🚀 Quick Start (Windows CMD/PowerShell)

### 📋 Prerequisites

- Node.js 18+ with npm
- Git for version control
- HEDERA compatible wallet (HashPack, Blade, Kabila)
- HEDERA account for testing and development

### ⚡ Development Start

```powershell
# Navigate to project directory
cd "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR"

# Quick development start (HEDERA only)
.\scripts\dev-start.ps1

# Run comprehensive HEDERA tests
.\scripts\comprehensive-test.ps1
```

### 🧪 Testing All Systems

```powershell
# Test HEDERA payment system
.\scripts\test-pos-flow.ps1

# Test HEDERA integration
cd frontend
npm run test:hedera

# Test individual components
npx tsx tests/priceDisplay.test.ts

# Test all systems
npm run test:local && npm run test:hedera
```

## 💰 Product Prices & HEDERA Conversion

| Product | IDR Price | HEDERA Price | Status |
|---------|-----------|--------------|--------|
| AIR RO 19L | Rp 6.000 | 2.00 HEDERA | ✅ |
| GALON 19L AQUA | Rp 20.000 | 6.67 HEDERA | ✅ |
| GALON 19L CLEO | Rp 18.000 | 6.00 HEDERA | ✅ |
| GALON PERTAMA | Rp 65.000 | 21.67 HEDERA | ✅ |

**Rate**: 1 HEDERA = 3,000 IDR (fixed rate)
**Conversion**: `Math.ceil(idrToHedera(price) * 100) / 100` (round up, 2 decimals)

## 🔗 URLs & Access

- **Frontend**: <http://localhost:3000>
- **POS System**: <http://localhost:3000/pos>
- **Backend API**: <http://localhost:4000>
- **Health Check**: <http://localhost:4000/health>

## 📱 Samsung Tab8 Android Deployment

### 🌐 RumahWeb Hosting Setup

1. **Login** to RumahWeb cPanel
2. **File Manager** → Navigate to `public_html`
3. **Upload** files from `deployment/` folder
4. **Setup Node.js**:

   ```bash
   cd public_html
   npm install --production
   npm run start
   ```

### 📲 Android APK Creation

1. **Open Android Studio**
2. **New Project** → "Trusted Web Activity"
3. **Configure**:
   - App Name: `Watercoin HEDERA POS`
   - Package: `com.watercoin.hederapos`
   - Host URL: `https://your-domain.com`
   - Start URL: `https://your-domain.com/pos`
   - Screen Orientation: `landscape`
4. **Build APK** and install on Samsung Tab8

### 📊 Testing Checklist

- [ ] Product selection with price display
- [ ] Price conversion IDR → HEDERA (2 decimal, round up)
- [ ] QR generation for payment
- [ ] Wallet integration (HashPack, Blade, Kabila, Yamgo)
- [ ] Transaction monitoring (10 minutes timeout)
- [ ] Samsung Tab8 layout (1200x1920 landscape)
- [ ] Touch targets ≥ 44px
- [ ] Responsive design

## 🌐 HEDERA Network Integration

- **Network**: HEDERA Testnet
- **Mirror Node API**: `https://testnet.mirrornode.hedera.com`
- **Watercoin Address**: `0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5`
- **Explorer**: [HEDERA Explorer Testnet](https://hashscan.io/testnet/account/0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5)

## 🧪 Manual Testing Flow

1. **Open POS**: <http://localhost:3000/pos>
2. **Select Product**: Click "AIR RO 19L" (Rp 6.000 ~ 2.00 HEDERA)
3. **Choose Payment**: Click "🚀 Pay with HEDERA"
4. **Scan QR**: Use HEDERA wallet (HashPack, Blade, Kabila, Yamgo) to scan QR
5. **Send Payment**: Send 2.00 HEDERA to address
6. **Verify**: Transaction confirmed on blockchain

## 📞 Support

- **Version**: 2.0.0 HEDERA Integration
- **Last Updated**: September 2025
- **Developer**: Watercoin Development Team

---

**🌊 Watercoin HEDERA POS System** - Modern blockchain-integrated POS for water depot with full HEDERA integration for Samsung Tab8 devices.

## 🏗️ Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   HEDERA        │
│   (Next.js 14)  │ ←→ │   (Node.js)     │ ←→ │   (DevNet)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ↑                       ↑                       ↑
    POS Interface         API & Database        Blockchain Storage
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (optimized for Samsung Tab8)
- **State Management**: React hooks
- **QR Generation**: QRCode.js
- **Responsive**: Tablet-first design (1200x1920)

### Backend

- **Runtime**: Node.js
- **Database**: Prisma ORM + SQLite
- **API**: RESTful endpoints
- **Environment**: Development & Production ready

### Blockchain

- **Platform**: HEDERA Testnet
- **SDK**: @hashgraph/sdk (Node.js/TypeScript)
- **Wallet Support**: HashPack, Blade, Kabila, Yamgo
- **Network**: `https://testnet.mirrornode.hedera.com`

## 📁 Project Structure

```text
AIv2HBAR/
├── 📁 frontend/                 # Next.js frontend application
│   ├── 📁 app/                  # App Router pages
│   │   ├── 📄 layout.tsx        # Root layout
│   │   ├── 📄 page.tsx          # Homepage with sensor monitoring
│   │   └── 📁 pos/              # POS system pages
│   │       ├── 📄 page.tsx      # Main POS interface
│   │       └── 📁 settings/     # POS settings
│   ├── 📁 components/           # React components
│   │   ├── 📄 HederaPayment.tsx  # HEDERA payment component
│   │   ├── 📄 Navbar.tsx        # Navigation bar
│   │   └── 📄 SensorCards.tsx   # Sensor display cards
│   ├── 📁 lib/                  # Utility libraries
│   │   ├── 📄 hederaAgent.ts     # HEDERA blockchain integration
│   │   ├── 📄 sensor.ts         # Sensor data handling
│   │   └── 📄 standards.ts      # Water quality standards
│   ├── 📁 styles/               # CSS modules
│   │   ├── 📄 globals.css       # Global styles
│   │   └── 📄 pos.module.css    # POS-specific styles (Samsung Tab8 optimized)
│   ├── 📁 tests/                # Test files
│   │   ├── 📄 posFlow.test.ts   # POS flow testing
│   │   └── 📄 priceDisplay.test.ts # Price conversion testing
│   └── 📁 public/               # Static assets
│       ├── 📄 manifest.json     # PWA manifest (Android optimized)
│       └── 🖼️ watercoinlogo.png  # Brand assets
├── 📁 server/                   # Backend server
│   ├── 📁 src/                  # Source code
│   │   ├── 📄 index.ts          # Main server file
│   │   └── 📄 sim.ts            # Sensor simulation
│   └── 📁 prisma/               # Database schema
│       ├── 📄 schema.prisma     # Database models
│       └── 📄 seed.ts           # Initial data
└── 📁 scripts/                  # Deployment scripts
    ├── 📄 test-pos-flow.ps1     # Windows testing script
    ├── 📄 test-pos-flow.sh      # Linux/WSL testing script
    └── 📄 android-deployment.ps1 # Android deployment prep
```

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Git**
- **Android Studio** (for APK deployment)

### 🔧 Development Setup

#### Windows (CMD/PowerShell)

```powershell
# 1. Clone repository
git clone https://github.com/your-repo/watercoin-hedera.git
cd watercoin-hedera

# 2. Navigate to frontend
cd "frontend"

# 3. Install dependencies
npm install

# 4. Setup environment variables
copy .env.example .env.local
# Edit .env.local with your configuration

# 5. Build project
npm run build

# 6. Start development server
npm run dev
```

#### WSL/Linux

```bash
# 1. Clone repository
git clone https://github.com/your-repo/watercoin-hedera.git
cd watercoin-hedera

# 2. Navigate to frontend
cd frontend

# 3. Install dependencies
npm install

# 4. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 5. Build project
npm run build

# 6. Start development server
npm run dev
```

### ⚡ Quick Testing (Using Scripts)

#### Windows

```powershell
cd "c:\Users\GL63\Project Development\Watercoin AI Monitoring\AIv2HBAR"
.\scripts\test-pos-flow.ps1
```

#### WSL/Linux Testing

```bash
cd "/mnt/c/Users/GL63/Project Development/Watercoin AI Monitoring/AIv2HBAR"
chmod +x scripts/test-pos-flow.sh
./scripts/test-pos-flow.sh
```

## 📱 Samsung Tab8 Deployment

### 🌐 Hosting Setup (RumahWeb cPanel)

1. **Login to RumahWeb cPanel**
2. **File Manager** → Navigate to `public_html`
3. **Upload** build files from `frontend/out` or `frontend/.next`
4. **Node.js Setup** (if available on hosting):

   ```bash
   cd public_html
   npm install --production
   npm run start
   ```

5. **Environment Variables Setup**:

   ```bash
   # Create .env.production file
   NEXT_PUBLIC_HEDERA_NETWORK=testnet
   NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS=0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5
   NEXT_PUBLIC_HEDERA_MIRROR_NODE=https://testnet.mirrornode.hedera.com
   NEXT_PUBLIC_API_URL=https://your-domain.com/api
   ```

### 📱 Android App Development

#### Using Android Studio (TWA)

1. **Open Android Studio**
2. **Create New Project** → Select "Trusted Web Activity"
3. **Configure Project**:
   - **App Name**: Watercoin HEDERA POS
   - **Package Name**: `com.watercoin.hederapos`
   - **Host URL**: `https://your-domain.com`
   - **Start URL**: `https://your-domain.com/pos`

4. **Optimize for Samsung Tab8**:

   ```xml
   <!-- In app/src/main/res/values/dimens.xml -->
   <resources>
       <dimen name="activity_horizontal_margin">32dp</dimen>
       <dimen name="activity_vertical_margin">32dp</dimen>
       <dimen name="fab_margin">24dp</dimen>
   </resources>
   ```

5. **Screen Orientation** (landscape preferred):

   ```xml
   <!-- In AndroidManifest.xml -->
   <activity
       android:name=".MainActivity"
       android:screenOrientation="landscape"
       android:exported="true">
   ```

#### Build & Deploy APK

```bash
# Generate signed APK
./gradlew assembleRelease

# Install on Samsung Tab8
adb install app/build/outputs/apk/release/app-release.apk
```

## 💰 Price Conversion System

### Current Rates

- **1 HEDERA = 3,000 IDR**
- **Conversion**: `Math.ceil(idrToHedera(price) * 100) / 100`
- **Display Format**: "Rp 6.000 ~ 2.00 HEDERA"

### Product Pricing

| Product | IDR Price | HEDERA Price |
|---------|-----------|--------------|
| AIR RO 19L | Rp 6.000 | 2.00 HEDERA |
| GALON 19L AQUA | Rp 20.000 | 6.67 HEDERA |
| GALON 19L CLEO | Rp 18.000 | 6.00 HEDERA |
| GALON PERTAMA | Rp 65.000 | 21.67 HEDERA |

## 🧪 Testing & Quality Assurance

### Automated Tests

```bash
# Run all tests
cd frontend
npx tsx tests/finalVerification.test.ts

# Specific tests
npx tsx tests/priceDisplay.test.ts
npx tsx tests/posFlow.test.ts
npx tsx tests/posFlowSimulation.test.ts
```

### Manual Testing Checklist

- [ ] **Product Selection**: Click all products, verify price display
- [ ] **Price Conversion**: Verify IDR → HEDERA accuracy (2 decimal places)
- [ ] **QR Generation**: Test QR code creation for payments
- [ ] **Wallet Integration**: Test deep links (HashPack, Blade, Kabila, Yamgo)
- [ ] **Transaction Monitoring**: 10-minute timeout verification
- [ ] **Samsung Tab8 Layout**: Test on 1200x1920 resolution
- [ ] **Touch Targets**: Verify button sizes ≥ 44px
- [ ] **Responsive Design**: Test landscape/portrait modes

### Performance Benchmarks

- **QR Generation**: < 500ms
- **Price Conversion**: < 50ms
- **HEDERA Network Call**: < 2s
- **Transaction Verification**: < 30s
- **Page Load Time**: < 3s

## 🔧 Configuration

### Environment Variables

```bash

# Required for HEDERA integration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS=0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5
NEXT_PUBLIC_HEDERA_MIRROR_NODE=https://testnet.mirrornode.hedera.com

# Optional for production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### Samsung Tab8 Optimizations

- **Screen Resolution**: 1200x1920 pixels
- **Preferred Orientation**: Landscape (1920x1200)
- **Touch Targets**: Minimum 44px x 44px
- **Font Sizes**: 18px+ for readability
- **Grid Layout**: 4 columns (landscape), 2 columns (portrait)

## 🚨 Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### HEDERA Connection Issues

```bash
# Verify network connectivity
curl https://testnet.mirrornode.hedera.com/api/v1/transactions?limit=1

# Check wallet address format
echo "0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5" | wc -c
```

#### Samsung Tab8 Display Issues

- Verify viewport meta tag in `app/layout.tsx`
- Check CSS media queries for tablet breakpoints
- Test with Chrome DevTools device simulation

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
npm run dev
```

## 📚 Documentation

### API Endpoints

- **GET** `/api/sensors` - Sensor data
- **POST** `/api/pos` - POS transactions
- **GET** `/api/logo` - Brand assets

### HEDERA Integration

- **Wallet Address**: `0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5`
- **Network**: Testnet
- **Mirror Node API**: `https://testnet.mirrornode.hedera.com`
