export const thresholds = {
  // Physical
  color: { max: 15 },
  odour: { required: true },
  taste: { required: true },
  turbidity: { max: 5 },
  temperature: { range: [22, 28] },
  tds: { max: 500 },
  // Chemical
  cod: { max: 10 },
  ph: { range: [6.5, 8.5] },
  hardness: { max: 500 },
  sulfate: { max: 250 },
  nitrite: { max: 3 },
  chloride: { max: 250 },
  nitrate: { max: 50 },
  cyanide: { max: 0.07 },
  fluoride: { max: 1.5 },
  ammonia: { max: 1.5 },
  aluminum: { max: 0.2 },
  copper: { max: 2 },
  iron: { max: 0.3 },
  manganese: { max: 0.4 },
  zinc: { max: 3 },
  // Microbiological
  total_coliform: { max: 0 },
  ecoli: { max: 0 }
} as const;

export const displayName: Record<string, string> = {
  color: 'Color', odour: 'Odor', taste: 'Taste', turbidity: 'Turbidity', temperature: 'Temperature', tds: 'TDS',
  ph: 'pH', cod: 'Organic Matter', hardness: 'Hardness', sulfate: 'Sulfate', nitrite: 'Nitrite', chloride: 'Chloride', nitrate: 'Nitrate', cyanide: 'Cyanide', fluoride: 'Fluoride', ammonia: 'Ammonia', aluminum: 'Aluminum', copper: 'Copper', iron: 'Iron', manganese: 'Manganese', zinc: 'Zinc',
  total_coliform: 'Total Coliform', ecoli: 'E. coli'
};

export const thresholdStrings: Record<string, string> = {
  color: 'max: 15 TCU',
  odour: 'qualitative: Odorless',
  taste: 'qualitative: Tasteless',
  turbidity: 'max: 5 NTU',
  temperature: 'qualitative: Ambient ±3°C',
  tds: 'max: 500 mg/L',
  cod: 'max: 10 (KMnO4 mg/L)',
  ph: '6.5 - 8.5',
  hardness: 'max: 500 mg/L',
  sulfate: 'max: 250 mg/L',
  nitrite: 'max: 3 mg/L',
  chloride: 'max: 250 mg/L',
  nitrate: 'max: 50 mg/L',
  cyanide: 'max: 0.07 mg/L',
  fluoride: 'max: 1.5 mg/L',
  ammonia: 'max: 1.5 mg/L',
  aluminum: 'max: 0.2 mg/L',
  copper: 'max: 2 mg/L',
  iron: 'max: 0.3 mg/L',
  manganese: 'max: 0.4 mg/L',
  zinc: 'max: 3 mg/L',
  total_coliform: 'max: 0 (Count/100 mL)',
  ecoli: 'max: 0 (Count/100 mL)'
};

export const brands = [
  { name: 'Cleo', phRange: [7.3, 8.1], tdsRange: [6, 13] },
  { name: 'Amidis', phRange: [7.4, 8.4], tdsRange: [0, 5] },
  { name: 'Watercoin', phRange: [7.3, 8.1], tdsRange: [14, 35] },
  { name: 'Le Minerale', phRange: [7.8, 8.4], tdsRange: [80, 90] },
  { name: 'Aqua', phRange: [7.7, 8.0], tdsRange: [50, 79] },
  { name: 'Pristine 8+', phRange: [8.0, 9.9], tdsRange: [91, 119] },
  { name: 'VIT', phRange: [6.0, 8.5], tdsRange: [120, 178] },
  { name: 'Nestle Pure Life', phRange: [7.7, 7.9], tdsRange: [36, 49] }
];

export default { thresholds, displayName, thresholdStrings, brands };

// Scheduler configuration for synthetic generator
export const scheduler = {
  windowSeconds: 60,
  slots: 60,
  safeCount: 36, // 3 parts
  badCount: 24   // 2 parts
};
