// HEDERA Integration Test - Full Blockchain Test Suite
import { HederaAgent, HEDERA_CONFIG } from './lib/hederaAgent';
import { saveSnapshotToHedera, addSurveyToHedera } from './lib/hederaHelpers';

console.log('🚀 TESTING HEDERA FULL INTEGRATION...\n');

let testsPassed = 0;
let totalTests = 8;

// Test 1: HEDERA Agent Initialization
console.log('Test 1: HEDERA Agent Initialization');
try {
  const hederaAgent = new HederaAgent(HEDERA_CONFIG.testnet);
  console.log('✅ HEDERA agent initialized successfully');
  hederaAgent.close();
  testsPassed++;
} catch (error) {
  console.log('❌ HEDERA agent initialization failed');
}

// Test 2: Network Health Check  
console.log('\nTest 2: Network Health Check');
try {
  const hederaAgent = new HederaAgent(HEDERA_CONFIG.testnet);
  const isHealthy = await hederaAgent.healthCheck();
  if (isHealthy) {
    console.log('✅ HEDERA network is healthy');
    testsPassed++;
  } else {
    console.log('❌ HEDERA network health check failed');
  }
  hederaAgent.close();
} catch (error) {
  console.log('❌ Network health check error');
}

// Test 3: Price Conversion Accuracy
console.log('\nTest 3: Price Conversion Accuracy');
try {
  const testPrice = 20000; // IDR
  const hederaAmount = HederaAgent.idrToHedera(testPrice);
  const backToIdr = HederaAgent.hederaToIdr(hederaAmount);
  
  if (Math.abs(testPrice - backToIdr) === 0) {
    console.log('✅ Price conversion accuracy perfect');
    testsPassed++;
  } else {
    console.log('❌ Price conversion inaccuracy detected');
  }
} catch (error) {
  console.log('❌ Price conversion test failed');
}

// Test 4: Payment URI Generation
console.log('\nTest 4: Payment URI Generation');
try {
  const hederaAgent = new HederaAgent(HEDERA_CONFIG.testnet);
  const paymentUri = hederaAgent.generatePaymentURI(6.6667, 'test-tx-123', 'Water purchase test');
  
  if (paymentUri.includes('hedera://') && paymentUri.includes('amount=6.67')) {
    console.log('✅ Payment URI generated correctly');
    testsPassed++;
  } else {
    console.log('❌ Payment URI format incorrect');
  }
  hederaAgent.close();
} catch (error) {
  console.log('❌ Payment URI generation failed');
}

// Test 5: Sensor Data Storage (HCS)
console.log('\nTest 5: Sensor Data Storage via HCS');
try {
  const testSnapshot = {
    timestamp: BigInt(Date.now()),
    deviceId: 'TEST-HEDERA-DEVICE',
    location: 'Test Location',
    tds: { value: 25, unit: 'ppm' },
    ph: { value: 7.6, unit: '' },
    turbidity: { value: 0.5, unit: 'NTU' }
  };
  
  const transactionId = await saveSnapshotToHedera(testSnapshot);
  if (transactionId) {
    console.log('✅ Sensor data saved to HEDERA HCS successfully');
    testsPassed++;
  } else {
    console.log('❌ Sensor data storage failed');
  }
} catch (error) {
  console.log('❌ Sensor data storage error');
}

// Test 6: Survey Data Storage (HCS)
console.log('\nTest 6: Survey Data Storage via HCS');
try {
  const transactionId = await addSurveyToHedera('positive');
  if (transactionId) {
    console.log('✅ Survey data saved to HEDERA HCS successfully');
    testsPassed++;
  } else {
    console.log('❌ Survey data storage failed');
  }
} catch (error) {
  console.log('❌ Survey data storage error');
}

// Test 7: Mirror Node Connectivity
console.log('\nTest 7: Mirror Node Connectivity');
try {
  const response = await fetch('https://testnet.mirrornode.hedera.com/api/v1/network/nodes?limit=1');
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Mirror node accessible, nodes available:', data.nodes?.length || 0);
    testsPassed++;
  } else {
    console.log('❌ Mirror node connection failed');
  }
} catch (error) {
  console.log('❌ Mirror node connectivity error');
}

// Test 8: Water Products Price Conversion
console.log('\nTest 8: Water Products Price Conversion');
try {
  const waterProducts = [
    { name: 'DRINKING WATER RO 19L', price: 6000 },
    { name: 'GALLON 19L AQUA', price: 20000 },
    { name: 'GALLON 19L CLEO', price: 18000 },
    { name: 'FIRST GALLON', price: 65000 }
  ];
  
  let allAccurate = true;
  for (const product of waterProducts) {
    const hederaAmount = HederaAgent.idrToHedera(product.price);
    const backToIdr = HederaAgent.hederaToIdr(hederaAmount);
    if (Math.abs(product.price - backToIdr) > 0) {
      allAccurate = false;
      break;
    }
  }
  
  if (allAccurate) {
    console.log('✅ All water products price conversion accurate');
    testsPassed++;
  } else {
    console.log('❌ Some water products price conversion failed');
  }
} catch (error) {
  console.log('❌ Water products test failed');
}

// Summary
console.log(`\n🎉 HEDERA INTEGRATION TEST RESULTS: ${testsPassed}/${totalTests} tests passed`);

if (testsPassed === totalTests) {
  console.log('🎊 PERFECT! FULL HEDERA INTEGRATION WORKING 100%');
  console.log('💧 Watercoin AI Monitoring - HEDERA-only system ready!');
} else {
  console.log('⚠️  Some HEDERA integration issues detected');
}

console.log('\n🌟 HEDERA SYSTEM FEATURES:');
console.log('   ⚡ Ultra-fast payments (3-5 seconds)');
console.log('   🌱 Energy efficient (99.99% less than Bitcoin)');
console.log('   💰 Low cost ($0.0001 per transaction)');
console.log('   🔒 Enterprise security (aBFT consensus)');
console.log('   📊 HCS for immutable sensor data storage');
console.log('   💱 Perfect IDR ↔ HEDERA conversion (1 HEDERA = 3000 IDR)');

console.log('\n🏁 HEDERA integration test completed');