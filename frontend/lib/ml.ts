import type { SensorPacket } from './sensor';
import { thresholds as stdThresholds, displayName as stdDisplay } from './standards';

type Params = SensorPacket['parameters'];

export function evaluateWaterSafety(params: Params, uvOn?: boolean): { safe: boolean; reason: string } {
  const reasons: string[] = [];

  // Helper to read numeric value safely from params
  const val = (k: string) => {
    const v = (params as any)[k];
    if (!v || v.value === undefined || Number.isNaN(Number(v.value))) return null;
    return Number(v.value);
  };

  // Enforce presence and thresholds for all required 23 parameters from the reference.
  const requiredKeys = [
    'color','odour','taste','turbidity','temperature','tds',
    'ph','cod','hardness','sulfate','nitrite','chloride','nitrate','cyanide','fluoride','ammonia','aluminum','copper','iron','manganese','zinc',
    'total_coliform','ecoli'
  ];

  for (const k of requiredKeys) {
    const t = (stdThresholds as any)[k];
    const v = val(k);
    const name = (stdDisplay as any)[k] ?? k;
    if (v === null) {
      reasons.push(`${name} not available`);
      continue;
    }
    // Qualitative checks
    if (k === 'odour' || k === 'taste') {
      if (v > 0) reasons.push(`${name} detected (must be: ${k === 'odour' ? 'Odorless' : 'Tasteless'})`);
      continue;
    }
    // Temperature special handling: expect ambient approx 25±3°C
    if (k === 'temperature') {
      const min = 22; const max = 28;
      if (v < min || v > max) reasons.push(`${name} ${v}°C outside ambient range ±3°C`);
      continue;
    }

    if (t?.range) {
      const [min, max] = (t as any).range;
      if (v < min || v > max) reasons.push(`${name} ${v} outside range ${min}-${max}`);
    } else {
      if ((t as any)?.max !== undefined && v > (t as any).max) reasons.push(`${name} ${v} exceeds limit ${(t as any).max}`);
      if ((t as any)?.min !== undefined && v < (t as any).min) reasons.push(`${name} ${v} below limit ${(t as any).min}`);
    }
  }

  // According to the reference, microbiological parameters must be zero: enforce strictly
  const ecoliVal = val('ecoli') ?? 0;
  const coliformVal = val('total_coliform') ?? 0;
  
  // SUPREME RULE: If UV sterilizer is OFF, water is ALWAYS UNSAFE regardless of other parameters
  // because microbiological parameters will have values > 0 when UV is off
  if (!uvOn) {
    reasons.push('UV sterilizer inactive - drinking water unsafe');
    return { safe: false, reason: reasons.join('; ') };
  }

  // If UV is ON, microbiological should be 0
  if (ecoliVal > 0) reasons.push(`E. coli ${ecoliVal} CFU/100mL detected (limit: 0)`);
  if (coliformVal > 0) reasons.push(`Total Coliform ${coliformVal} CFU/100mL detected (limit: 0)`);

  const safe = reasons.length === 0;
  const reason = safe ? 'All parameters meet SNI standards' : reasons.join('; ');
  return { safe, reason };
}


