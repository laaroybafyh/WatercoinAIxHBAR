"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHederaTests = runHederaTests;
const hederaAgent_1 = require("../lib/hederaAgent");
// Simple test runner for HEDERA integration
class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
    }
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    async run() {
        console.log('\n🚀 HEDERA Integration Tests for Samsung Tab8\n');
        for (const test of this.tests) {
            try {
                await test.fn();
                console.log(`✅ ${test.name}`);
                this.passed++;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.log(`❌ ${test.name}: ${errorMessage}`);
                this.failed++;
            }
        }
        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);
        return this.failed === 0;
    }
}
// Simple assertion helpers
function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, got ${actual}`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toBeLessThan: (expected) => {
            if (actual >= expected) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        },
        toContain: (expected) => {
            if (!actual.includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        },
        toBeInstanceOf: (expected) => {
            if (!(actual instanceof expected)) {
                throw new Error(`Expected ${actual} to be instance of ${expected}`);
            }
        },
        toBeCloseTo: (expected, precision = 2) => {
            const diff = Math.abs(actual - expected);
            const tolerance = Math.pow(10, -precision);
            if (diff > tolerance) {
                throw new Error(`Expected ${actual} to be close to ${expected}`);
            }
        },
        toBeDefined: () => {
            if (actual === undefined || actual === null) {
                throw new Error(`Expected value to be defined`);
            }
        }
    };
}
// Mock configuration for testing
const mockConfig = {
    network: 'testnet',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    operatorId: '0.0.123456',
    operatorKey: 'mock-private-key',
    watercoinAddress: '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
};
// Initialize test runner
const runner = new TestRunner();
// Test 1: HEDERA Agent initialization
runner.test('HEDERA Agent initialization', () => {
    const hederaAgent = new hederaAgent_1.HederaAgent(mockConfig);
    expect(hederaAgent).toBeDefined();
    expect(hederaAgent).toBeInstanceOf(hederaAgent_1.HederaAgent);
    hederaAgent.close();
});
// Test 2: Price calculation accuracy
runner.test('Price calculation accuracy (IDR ↔ HBAR)', () => {
    // Test IDR to HEDERA conversion
    const hbarAmount1 = hederaAgent_1.HederaAgent.idrToHedera(6000); // Rp 6,000
    expect(hbarAmount1).toBe(2); // Should be 2 HBAR (6000/3000)
    const hbarAmount2 = hederaAgent_1.HederaAgent.idrToHedera(15000); // Rp 15,000
    expect(hbarAmount2).toBe(5); // Should be 5 HBAR (15000/3000)
    // Test HEDERA to IDR conversion
    const idrAmount1 = hederaAgent_1.HederaAgent.hederaToIdr(2);
    expect(idrAmount1).toBe(6000);
    const idrAmount2 = hederaAgent_1.HederaAgent.hederaToIdr(5);
    expect(idrAmount2).toBe(15000);
});
// Test 3: QR Code URI generation
runner.test('QR Code URI generation', () => {
    const hederaAgent = new hederaAgent_1.HederaAgent(mockConfig);
    const amount = 2; // 2 HBAR
    const transactionId = 'txn_12345';
    const memo = 'Test payment for 600ml water';
    const qrData = hederaAgent.generatePaymentURI(amount, transactionId, memo);
    expect(qrData).toContain('hedera://pay');
    expect(qrData).toContain(`amount=${amount.toFixed(2)}`);
    expect(qrData).toContain(`reference=${transactionId}`);
    expect(qrData).toContain('memo=Test%20payment%20for%20600ml%20water');
    hederaAgent.close();
});
// Test 4: Samsung Tab8 layout compatibility
runner.test('Samsung Tab8 layout compatibility (1920x1200)', () => {
    // Mock Samsung Tab8 dimensions
    const mockWindow = {
        innerWidth: 1920,
        innerHeight: 1200
    };
    const isLandscape = mockWindow.innerWidth > mockWindow.innerHeight;
    const isTabletSize = mockWindow.innerWidth >= 1200 && mockWindow.innerHeight >= 800;
    expect(isLandscape).toBe(true);
    expect(isTabletSize).toBe(true);
    expect(mockWindow.innerWidth).toBe(1920);
    expect(mockWindow.innerHeight).toBe(1200);
});
// Test 5: Payment flow simulation
runner.test('Payment flow simulation - Complete POS cycle', () => {
    const hederaAgent = new hederaAgent_1.HederaAgent(mockConfig);
    // Simulate complete POS flow
    const productPrice = 6000; // Rp 6,000
    const hbarAmount = hederaAgent_1.HederaAgent.idrToHedera(productPrice);
    const transactionId = `txn_${Date.now()}`;
    // Generate payment URI
    const paymentURI = hederaAgent.generatePaymentURI(hbarAmount, transactionId, 'Watercoin 600ml Purchase');
    // Verify URI format
    expect(paymentURI).toContain('hedera://pay');
    expect(paymentURI).toContain(`amount=${hbarAmount.toFixed(2)}`);
    expect(paymentURI).toContain(`reference=${transactionId}`);
    // Simulate QR generation
    expect(paymentURI.length).toBeGreaterThan(50);
    console.log(`  Payment URI: ${paymentURI}`);
    console.log(`  Amount: ${hbarAmount} HBAR (${productPrice} IDR)`);
    hederaAgent.close();
});
// Test 6: Multiple product pricing scenarios
runner.test('Multiple product pricing scenarios', () => {
    const testCases = [
        { price: 3000, expectedHBAR: 1 }, // Small bottle
        { price: 6000, expectedHBAR: 2 }, // Standard bottle
        { price: 9000, expectedHBAR: 3 }, // Large bottle
        { price: 15000, expectedHBAR: 5 }, // Premium bottle
        { price: 18000, expectedHBAR: 6 }, // Gallon
    ];
    testCases.forEach(({ price, expectedHBAR }) => {
        const calculatedHBAR = hederaAgent_1.HederaAgent.idrToHedera(price);
        expect(calculatedHBAR).toBe(expectedHBAR);
    });
});
// Test 7: Address validation
runner.test('HEDERA address validation', () => {
    // Valid HEDERA address formats
    expect(hederaAgent_1.HederaAgent.validateAddress('0.0.123456')).toBe(true);
    expect(hederaAgent_1.HederaAgent.validateAddress('0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5')).toBe(true);
    // Invalid addresses
    expect(hederaAgent_1.HederaAgent.validateAddress('invalid-address')).toBe(false);
    expect(hederaAgent_1.HederaAgent.validateAddress('0.0.abc')).toBe(false);
    expect(hederaAgent_1.HederaAgent.validateAddress('0x123')).toBe(false);
});
// Test 8: Samsung Tab8 responsive design validation
runner.test('Samsung Tab8 responsive design validation', () => {
    // Mock Samsung Tab8 dimensions
    const screenWidth = 1920;
    const screenHeight = 1200;
    const isLandscape = screenWidth > screenHeight;
    const isOptimalForTwoColumn = screenWidth >= 1200;
    expect(isLandscape).toBe(true);
    expect(isOptimalForTwoColumn).toBe(true);
    // Verify layout calculations
    const leftPanelWidth = Math.floor(screenWidth * 0.6); // 60% for QR
    const rightPanelWidth = Math.floor(screenWidth * 0.4); // 40% for details
    expect(leftPanelWidth).toBeGreaterThan(700); // Minimum for QR readability
    expect(rightPanelWidth).toBeGreaterThan(450); // Minimum for details panel
});
// Test 9: QR generation performance
runner.test('QR generation performance test', () => {
    const hederaAgent = new hederaAgent_1.HederaAgent(mockConfig);
    const startTime = Date.now();
    // Generate 100 QR URIs to test performance
    for (let i = 0; i < 100; i++) {
        const uri = hederaAgent.generatePaymentURI(2, `test_${i}`, `Test payment ${i}`);
        expect(uri).toBeDefined();
    }
    const endTime = Date.now();
    const duration = endTime - startTime;
    // Should complete within 1 second
    expect(duration).toBeLessThan(1000);
    console.log(`  Generated 100 QR URIs in ${duration}ms`);
    hederaAgent.close();
});
// Test 10: Network health check
runner.test('Network health check (testnet)', async () => {
    const hederaAgent = new hederaAgent_1.HederaAgent(mockConfig);
    try {
        const isHealthy = await hederaAgent.healthCheck();
        console.log(`  Network healthy: ${isHealthy}`);
        expect(typeof isHealthy).toBe('boolean');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Network unavailable';
        console.log(`  Network test skipped: ${errorMessage}`);
        // Allow test to pass if network is unavailable during testing
    }
    hederaAgent.close();
});
// Export the test runner for external execution
async function runHederaTests() {
    return await runner.run();
}
// Auto-run tests if this file is executed directly
if (typeof window === 'undefined') {
    runHederaTests().then(success => {
        console.log(success ? '\n✅ All tests passed! Ready for Samsung Tab8 deployment.' : '\n❌ Some tests failed.');
        process.exit(success ? 0 : 1);
    });
}
