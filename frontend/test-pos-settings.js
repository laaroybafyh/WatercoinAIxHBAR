// Simple test script to validate POS settings functionality
console.log('🧪 Testing POS Settings Functionality...');

// Test 1: Price input validation
console.log('\n1️⃣ Testing Price Input:');
const testPrices = ['00123', '0.50', '1000', '12.99', 'abc', ''];
testPrices.forEach(price => {
  console.log(`Input: "${price}" => Valid: ${/^\d*\.?\d*$/.test(price)}`);
});

// Test 2: Leading zero removal logic
console.log('\n2️⃣ Testing Leading Zero Removal:');
function removeLeadingZeros(value) {
  if (value === '') return '';
  if (/^\d*\.?\d*$/.test(value)) {
    if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
      value = value.replace(/^0+/, '');
    }
    if (value === '') value = '0';
    return value;
  }
  return value;
}

const testValues = ['00123', '0123', '0.5', '000', '0000.50'];
testValues.forEach(val => {
  console.log(`"${val}" => "${removeLeadingZeros(val)}"`);
});

// Test 3: Product creation validation
console.log('\n3️⃣ Testing Product Creation:');
function validateProduct(name, priceInput) {
  const price = parseFloat(priceInput);
  const isValid = name.trim() && !isNaN(price) && price > 0;
  return { isValid, name: name.trim(), price };
}

const testProducts = [
  ['Water Bottle', '6000'],
  ['', '5000'],
  ['Test Product', '0'],
  ['Another Product', 'abc'],
  ['Valid Product', '12.50']
];

testProducts.forEach(([name, price]) => {
  const result = validateProduct(name, price);
  console.log(`Product: "${name}", Price: "${price}" => Valid: ${result.isValid}`);
});

console.log('\n✅ Test script completed!');