import { evaluateWaterSafety } from '../lib/ml.js';

(async function() {
  // create a params-like object where all values are within safe thresholds
  const params: any = {
    color: { value: 5 }, odour: { value: 0 }, taste: { value: 0 }, turbidity: { value: 1 }, temperature: { value: 25 }, tds: { value: 30 },
    ph: { value: 7.5 }, cod: { value: 1 }, hardness: { value: 100 }, sulfate: { value: 20 }, nitrite: { value: 0.1 }, chloride: { value: 50 }, nitrate: { value: 10 }, cyanide: { value: 0 }, fluoride: { value: 0.2 }, ammonia: { value: 0 }, aluminum: { value: 0.01 }, copper: { value: 0.1 }, iron: { value: 0.01 }, manganese: { value: 0.01 }, zinc: { value: 0.2 },
    total_coliform: { value: 0 }, ecoli: { value: 0 }
  };
  const res = evaluateWaterSafety(params, true); // uv sterilizer ON
  console.log('ml test result (uv on):', res);
  if (!res.safe) throw new Error('expected safe for crafted params with UV ON');
  console.log('ml.test.ts passed');
})();
