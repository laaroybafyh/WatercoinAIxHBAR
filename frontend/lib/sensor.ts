export type Scalar = { value: number; unit: string; status?: string };
import { scheduler } from './standards';

export type SensorPacket = {
  timestamp: string;
  deviceId: string;
  location: string;
  parameters: {
    // Physical
    tds: Scalar;
    tss: Scalar;
    turbidity: Scalar;
    color: Scalar;
    temperature: Scalar;
    conductivity: Scalar;

    // Chemical
    ph: Scalar;
    dissolved_oxygen: Scalar;
    cod: Scalar;
    bod: Scalar;
  nitrite: Scalar;
  nitrate: Scalar;
  ammonia: Scalar;
  sulfate: Scalar;
  cyanide: Scalar;
  zinc: Scalar;
    chloride: Scalar;
    fluoride: Scalar;
    aluminum: Scalar;
    iron: Scalar;
    manganese: Scalar;
  copper: Scalar;
  hardness: Scalar;
  odour: Scalar; // presence as 0/1
  taste: Scalar; // presence as 0/1

    // Microbiological
    ecoli: Scalar;
    total_coliform: Scalar;
  };
  metadata: {
    batteryLevel: number;
    signalStrength: number;
    lastMaintenance: string;
    calibrationDue: string;
  };
};

function randRange(min: number, max: number, decimals = 2) {
  const n = Math.random() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

export function generateRandomSensorPacket(uvSterilizerOn?: boolean): SensorPacket {
  // Scheduled generator: produce 60 samples per minute with a 3:2 safe:bad ratio
  // Implementation details:
  // - maintain a per-module schedule array of length 60 containing 'safe' and 'bad'
  // - shuffle the schedule each minute and iterate an index each call
  // - safe packets are generated within evaluator thresholds; bad packets violate at least one threshold

  // Module-level state (initialized lazily)
  if (!(globalThis as any).__wc_schedule) {
    (globalThis as any).__wc_schedule = {
      schedule: [] as ('safe' | 'bad')[],
      idx: 0,
      startTs: 0
    };
  }
  const state = (globalThis as any).__wc_schedule as { schedule: ('safe' | 'bad')[]; idx: number; startTs: number };
  // read scheduler config
  // ESM import (static) – placed inside function to defer until first call
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // scheduler imported statically above for ESM compatibility

  const now = Date.now();
  // start a fresh minute window when uninitialized or when 60s passed
  if (!state.startTs || now - state.startTs >= scheduler.windowSeconds * 1000) {
    state.startTs = now;
    state.idx = 0;
    // build schedule according to scheduler config
    const arr: ('safe' | 'bad')[] = [];
    for (let i = 0; i < scheduler.safeCount; i++) arr.push('safe');
    for (let i = 0; i < scheduler.badCount; i++) arr.push('bad');
    // simple Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      if (arr[i] !== undefined && arr[j] !== undefined) {
        const tmp: 'safe' | 'bad' = arr[i]!; 
        arr[i] = arr[j]!; 
        arr[j] = tmp;
      }
    }
  state.schedule = arr;
  }

  const mode = state.schedule[state.idx % state.schedule.length];
  state.idx = (state.idx + 1) % scheduler.slots;

  // helper creators
  const createBase = () => ({
    timestamp: new Date().toISOString(),
    deviceId: 'WATER_SENSOR_001',
    location: 'Depot Watercoin Makmur',
    metadata: {
      batteryLevel: Math.round(randRange(50, 100, 0)),
      signalStrength: -Math.round(randRange(30, 80, 0)),
      lastMaintenance: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      calibrationDue: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    }
  });

  // safe ranges aligned with thresholds in ml.ts
  const safePacket = (): SensorPacket => {
    const ph = randRange(6.6, 8.4, 1);
    const tds = Math.round(randRange(1, 100, 0));
    
    // Mikrobiologi bergantung pada UV sterilizer
    let ecoliValue = 0;
    let totalColiformValue = 0;
    
    // Jika UV OFF, ada kontaminasi mikrobiologi yang signifikan
    if (uvSterilizerOn === false) {
      ecoliValue = Math.round(randRange(1, 15, 0)); // 1-15 CFU/100mL
      totalColiformValue = Math.round(randRange(3, 25, 0)); // 3-25 CFU/100mL (selalu lebih tinggi dari E.coli)
    }
    
    return {
      ...createBase(),
      parameters: {
        tds: { value: tds, unit: 'ppm' },
        tss: { value: randRange(0, 10), unit: 'mg/L' },
        turbidity: { value: randRange(0, 3, 1), unit: 'NTU' },
        color: { value: randRange(0, 10, 0), unit: 'TCU' },
        temperature: { value: randRange(23, 26, 1), unit: '°C' },
        conductivity: { value: randRange(200, 800, 0), unit: 'µS/cm' },
        ph: { value: ph, unit: '' },
        dissolved_oxygen: { value: randRange(6, 9), unit: 'mg/L' },
        cod: { value: randRange(0, 5, 1), unit: 'mg/L' },
        bod: { value: randRange(0, 2, 1), unit: 'mg/L' },
        nitrite: { value: randRange(0, 0.5, 2), unit: 'mg/L' },
        nitrate: { value: randRange(0, 20, 1), unit: 'mg/L' },
        ammonia: { value: randRange(0, 0.5, 2), unit: 'mg/L' },
        sulfate: { value: randRange(0, 100, 1), unit: 'mg/L' },
        chloride: { value: randRange(0, 100, 1), unit: 'mg/L' },
        fluoride: { value: randRange(0, 0.5, 2), unit: 'mg/L' },
        aluminum: { value: randRange(0, 0.05, 2), unit: 'mg/L' },
        iron: { value: randRange(0, 0.1, 2), unit: 'mg/L' },
        manganese: { value: randRange(0, 0.05, 2), unit: 'mg/L' },
        copper: { value: randRange(0, 0.5, 2), unit: 'mg/L' },
        cyanide: { value: randRange(0, 0.01, 3), unit: 'mg/L' },
        zinc: { value: randRange(0, 1, 2), unit: 'mg/L' },
        hardness: { value: randRange(50, 300, 0), unit: 'mg/L' },
        odour: { value: 0, unit: '' },
        taste: { value: 0, unit: '' },
        ecoli: { value: ecoliValue, unit: 'CFU/100mL' },
        total_coliform: { value: totalColiformValue, unit: 'CFU/100mL' }
      }
    } as SensorPacket;
  };

  // bad packet: ensure at least one parameter violates threshold (randomly choose which)
  const badPacket = (): SensorPacket => {
    // start from a safe packet then inject one or more violations
    const base = safePacket();
    // pick 1-3 violations
    const violations = Math.floor(randRange(1, 3, 0));
    const keys = ['tds','turbidity','color','temperature','ph','cod','hardness','sulfate','nitrite','chloride','nitrate','cyanide','fluoride','ammonia','aluminum','copper','iron','manganese','zinc','total_coliform','ecoli'];
    for (let i = 0; i < violations; i++) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      switch (k) {
        case 'tds': base.parameters.tds.value = Math.round(randRange(600, 2000, 0)); break;
        case 'turbidity': base.parameters.turbidity.value = randRange(6, 50, 1); break;
        case 'color': base.parameters.color.value = Math.round(randRange(16, 80, 0)); break;
        case 'temperature': base.parameters.temperature.value = randRange(29, 40, 1); break;
        case 'ph': base.parameters.ph.value = randRange(4.5, 10, 1); break;
        case 'cod': base.parameters.cod.value = randRange(11, 50, 1); break;
        case 'hardness': base.parameters.hardness.value = randRange(501, 1000, 0); break;
        case 'sulfate': base.parameters.sulfate.value = randRange(251, 800, 1); break;
        case 'nitrite': base.parameters.nitrite.value = randRange(4, 20, 2); break;
        case 'chloride': base.parameters.chloride.value = randRange(251, 1000, 1); break;
        case 'nitrate': base.parameters.nitrate.value = randRange(51, 300, 1); break;
        case 'cyanide': base.parameters.cyanide.value = randRange(0.08, 1, 3); break;
        case 'fluoride': base.parameters.fluoride.value = randRange(1.6, 5, 2); break;
        case 'ammonia': base.parameters.ammonia.value = randRange(1.6, 10, 2); break;
        case 'aluminum': base.parameters.aluminum.value = randRange(0.21, 5, 2); break;
        case 'copper': base.parameters.copper.value = randRange(2.1, 10, 2); break;
        case 'iron': base.parameters.iron.value = randRange(0.31, 5, 2); break;
        case 'manganese': base.parameters.manganese.value = randRange(0.41, 5, 2); break;
        case 'zinc': base.parameters.zinc.value = randRange(3.1, 20, 2); break;
        case 'total_coliform': 
          // Ketika UV OFF, gunakan nilai yang lebih tinggi
          if (uvSterilizerOn === false) {
            base.parameters.total_coliform.value = Math.round(randRange(15, 80, 0));
          } else {
            base.parameters.total_coliform.value = Math.round(randRange(1, 50, 0));
          }
          break;
        case 'ecoli': 
          // Ketika UV OFF, gunakan nilai yang lebih tinggi
          if (uvSterilizerOn === false) {
            base.parameters.ecoli.value = Math.round(randRange(8, 40, 0));
          } else {
            base.parameters.ecoli.value = Math.round(randRange(1, 20, 0));
          }
          break;
        default: break;
      }
    }
    // also occasionally set odour/taste
    if (Math.random() > 0.6) base.parameters.odour.value = 1;
    if (Math.random() > 0.7) base.parameters.taste.value = 1;
    return base;
  };

  return mode === 'safe' ? safePacket() : badPacket();
}


