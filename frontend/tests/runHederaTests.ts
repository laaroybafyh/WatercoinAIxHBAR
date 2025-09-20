// Simple Test Runner for HEDERA Integration
// Run this with: npm run test:hedera

import { HederaAgent, HEDERA_CONFIG } from '../lib/hederaAgent.js';

console.log('🧪 Starting HEDERA Integration Tests...\n');

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  function test(name: string, testFn: () => void | Promise<void>) {
    return async () => {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error}`);
        failed++;
      }
    };
  }

  // Currency Conversion Tests
  await test('IDR to HEDERA conversion', () => {
    const result1 = HederaAgent.idrToHedera(3000);
    const result2 = HederaAgent.idrToHedera(6000);
    
    if (result1 !== 1.0) throw new Error(`Expected 1.0, got ${result1}`);
    if (result2 !== 2.0) throw new Error(`Expected 2.0, got ${result2}`);
  })();

  await test('HEDERA to IDR conversion', () => {
    const result1 = HederaAgent.hederaToIdr(1.0);
    const result2 = HederaAgent.hederaToIdr(2.5);
    
    if (result1 !== 3000) throw new Error(`Expected 3000, got ${result1}`);
    if (result2 !== 7500) throw new Error(`Expected 7500, got ${result2}`);
  })();

  // Address Validation Tests
  await test('HEDERA address validation', () => {
    const valid1 = HederaAgent.validateAddress('0.0.123456');
    const valid2 = HederaAgent.validateAddress('0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5');
    const invalid1 = HederaAgent.validateAddress('invalid');
    const invalid2 = HederaAgent.validateAddress('0x123');
    
    if (!valid1) throw new Error('Valid HEDERA ID should pass');
    if (!valid2) throw new Error('Valid hex address should pass');
    if (invalid1) throw new Error('Invalid address should fail');
    if (invalid2) throw new Error('Short hex address should fail');
  })();

  // Payment URI Generation Test
  await test('Payment URI generation', () => {
    const hederaAgent = new HederaAgent(HEDERA_CONFIG.testnet);
    const uri = hederaAgent.generatePaymentURI(2.0, 'test_123', 'Test payment');
    
    if (!uri.includes('hedera://pay?')) throw new Error('URI should contain protocol');
    if (!uri.includes('amount=2.00')) throw new Error('URI should contain amount');
    if (!uri.includes('reference=test_123')) throw new Error('URI should contain reference');
    if (!uri.includes('memo=')) throw new Error('URI should contain memo');
    
    hederaAgent.close();
  })();

  // Configuration Tests
  await test('Testnet configuration', () => {
    const config = HEDERA_CONFIG.testnet;
    
    if (config.network !== 'testnet') throw new Error('Network should be testnet');
    if (!config.mirrorNodeUrl.includes('testnet')) throw new Error('Mirror URL should be testnet');
    if (!config.watercoinAddress) throw new Error('Watercoin address should be set');
  })();

  await test('Mainnet configuration', () => {
    const config = HEDERA_CONFIG.mainnet;
    
    if (config.network !== 'mainnet') throw new Error('Network should be mainnet');
    if (!config.mirrorNodeUrl.includes('mainnet')) throw new Error('Mirror URL should be mainnet');
    if (!config.watercoinAddress) throw new Error('Watercoin address should be set');
  })();

  // Health Check Test (network dependent)
  await test('Network health check', async () => {
    const hederaAgent = new HederaAgent(HEDERA_CONFIG.testnet);
    const isHealthy = await hederaAgent.healthCheck();
    hederaAgent.close();
    
    // Health check can fail in development, so we just log the result
    console.log(`   Network health: ${isHealthy ? 'OK' : 'Failed (expected in dev)'}`);
  })();

  // Product Price Tests
  await test('Product price calculations', () => {
    const products = [
      { name: 'DRINKING WATER RO 19L', price: 6000 },
      { name: 'GALLON 19L AQUA', price: 20000 },
      { name: 'GALLON 19L CLEO', price: 18000 },
      { name: 'FIRST GALLON', price: 65000 }
    ];

    products.forEach(product => {
      const hederaAmount = HederaAgent.idrToHedera(product.price);
      const backToIDR = HederaAgent.hederaToIdr(hederaAmount);
      
      if (hederaAmount <= 0) throw new Error(`HEDERA amount should be positive for ${product.name}`);
      if (Math.abs(backToIDR - product.price) > 1) throw new Error(`Round-trip conversion failed for ${product.name}`);
    });
  })();

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('❌ Some tests failed - check HEDERA configuration');
    process.exit(1);
  } else {
    console.log('✅ All tests passed - HEDERA integration ready!');
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});