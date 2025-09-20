import { generateRandomSensorPacket } from '../lib/sensor.js';
import { scheduler } from '../lib/standards.js';

// Simple distribution test: call generator slots times and count safe vs bad by evaluating microbiology and tds
(async function() {
  const counts = { safe: 0, bad: 0 } as any;
  const samples = [] as any[];
  for (let i = 0; i < scheduler.slots; i++) {
    const p = generateRandomSensorPacket();
    samples.push(p);
  }
  // Very simple heuristic: packet considered bad if E. coli > 0 or TDS > 500 or turbidity > 5
  for (const p of samples) {
    const ecoli = Number(p.parameters.ecoli.value || 0);
    const tds = Number(p.parameters.tds.value || 0);
    const turb = Number(p.parameters.turbidity.value || 0);
    if (ecoli > 0 || tds > 500 || turb > 5) counts.bad++; else counts.safe++;
  }

  console.log('Generator distribution (safe/bad):', counts);
  if (counts.safe + counts.bad !== scheduler.slots) throw new Error('slot count mismatch');
  // Expect at least some bad and some safe
  if (counts.safe === 0 || counts.bad === 0) throw new Error('unexpected all-safe or all-bad');
  console.log('generator.test.ts passed');
})();
