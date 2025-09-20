/**
 * 💰 HEDERA Price Display Test Suite
 * ===================================
 * Tests for accurate IDR ↔ HBAR price conversion and display
 */

// Price conversion functions
const HBAR_TO_IDR_RATE = 3000; // 1 HBAR = Rp 3,000

function idrToHbar(idrAmount: number): number {
  return idrAmount / HBAR_TO_IDR_RATE;
}

function formatHbarPrice(hbarAmount: number): number {
  return Math.ceil(hbarAmount * 100) / 100; // Round up to 2 decimals
}

function formatPriceDisplay(idrPrice: number): string {
  const hbarPrice = formatHbarPrice(idrToHbar(idrPrice));
  return `Rp ${idrPrice.toLocaleString('id-ID')} ~ ${hbarPrice.toFixed(2)} HBAR`;
}

// Product prices
const products = [
  { name: "AIR RO 19L", idr: 6000, expectedHbar: 2.00 },
  { name: "GALON 19L AQUA", idr: 20000, expectedHbar: 6.67 },
  { name: "GALON 19L CLEO", idr: 18000, expectedHbar: 6.00 },
  { name: "GALON PERTAMA", idr: 65000, expectedHbar: 21.67 }
];

// Test execution
console.log("🧪 HEDERA Price Display Test Suite");
console.log("===================================");

let allTestsPassed = true;

products.forEach(product => {
  const actualHbar = formatHbarPrice(idrToHbar(product.idr));
  const displayText = formatPriceDisplay(product.idr);
  
  const testPassed = actualHbar === product.expectedHbar;
  allTestsPassed = allTestsPassed && testPassed;
  
  console.log(`\n📦 ${product.name}:`);
  console.log(`   IDR: Rp ${product.idr.toLocaleString('id-ID')}`);
  console.log(`   Expected HBAR: ${product.expectedHbar}`);
  console.log(`   Actual HBAR: ${actualHbar}`);
  console.log(`   Display: ${displayText}`);
  console.log(`   Status: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
});

console.log("\n📊 Test Summary:");
console.log(`===================================`);
console.log(`Overall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log(`Conversion Rate: 1 HBAR = Rp ${HBAR_TO_IDR_RATE.toLocaleString('id-ID')}`);
console.log(`Rounding: Round up to 2 decimal places`);

// Additional accuracy tests
console.log("\n🎯 Conversion Accuracy Tests:");
console.log("===================================");

const testCases = [
  { idr: 6000, expected: "2.00" },
  { idr: 20000, expected: "6.67" },
  { idr: 18000, expected: "6.00" },
  { idr: 65000, expected: "21.67" }
];

testCases.forEach(test => {
  const result = formatHbarPrice(idrToHbar(test.idr));
  const passed = result.toFixed(2) === test.expected;
  console.log(`Rp ${test.idr.toLocaleString('id-ID')} → ${result.toFixed(2)} HBAR (expected: ${test.expected}) ${passed ? '✅' : '❌'}`);
});

if (allTestsPassed) {
  console.log("\n🎉 All price display tests completed successfully!");
  process.exit(0);
} else {
  console.log("\n❌ Some price display tests failed!");
  process.exit(1);
}