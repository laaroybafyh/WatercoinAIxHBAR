import 'dotenv/config';

function rand(min: number, max: number, d = 2) {
  const n = Math.random() * (max - min) + min;
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

async function run() {
  const base = process.env.SIM_API_BASE || 'http://localhost:4000';
  const apiKey = process.env.SIM_API_KEY || 'dev-key';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ph = rand(6.3, 8.2, 1);
    const tds = Math.round(rand(1, 250, 0));
    const raw = { ph, tds };
    try {
      await fetch(`${base}/ingest`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ deviceId: 'SIM_DEVICE_1', parameters: { ph, tds }, raw })
      });
      // eslint-disable-next-line no-console
      console.log('sent', { ph, tds });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('send failed', e);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();


