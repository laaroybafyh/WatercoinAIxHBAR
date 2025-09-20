// Debug HEDERA price conversion
import { HederaAgent } from '../lib/hederaAgent.js';

const products = [
  { name: 'DRINKING WATER RO 19L', price: 6000 },
  { name: 'GALLON 19L AQUA', price: 20000 },
  { name: 'GALLON 19L CLEO', price: 18000 },
  { name: 'FIRST GALLON', price: 65000 }
];

console.log('🔍 Debugging Price Conversions:\n');

products.forEach(product => {
  const hederaAmount = HederaAgent.idrToHedera(product.price);
  const backToIDR = HederaAgent.hederaToIdr(hederaAmount);
  const diff = Math.abs(backToIDR - product.price);
  
  console.log(`${product.name}:`);
  console.log(`  ${product.price} IDR -> ${hederaAmount} HBAR -> ${backToIDR} IDR`);
  console.log(`  Difference: ${diff} IDR (${diff > 1 ? 'FAIL' : 'PASS'})\n`);
});