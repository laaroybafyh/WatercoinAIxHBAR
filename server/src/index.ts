import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import { z } from 'zod';
import crypto from 'crypto';

const app = express();
const log = pino({ transport: { target: 'pino-pretty' } });
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'] }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

// API key middleware for IoT ingestion & POS operations
app.use((req, res, next) => {
  if (req.path.startsWith('/public')) return next();
  const apiKey = req.header('x-api-key');
  if (!apiKey) return res.status(401).json({ error: 'missing api key' });
  // In production compare hashed keys
  (async () => {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return res.status(403).json({ error: 'no tenant configured' });
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    if (hash !== tenant.apiKeyHash) return res.status(403).json({ error: 'invalid api key' });
    (req as any).tenantId = tenant.id;
    next();
  })().catch(next);
});

// Ingestion endpoint for sensors
const IngestSchema = z.object({
  deviceId: z.string(),
  location: z.string().optional(),
  parameters: z.object({ ph: z.number(), tds: z.number() }),
  raw: z.any()
});

app.post('/ingest', async (req, res) => {
  const parse = IngestSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { deviceId, parameters, raw } = parse.data;
  let device = await prisma.device.findUnique({ where: { deviceId } });
  if (!device) {
    const tenantId = (req as any).tenantId as string;
    const loc = await prisma.location.findFirst({ where: { tenantId } })
      ?? await prisma.location.create({ data: { tenantId, name: 'Default' } });
    device = await prisma.device.create({ data: { deviceId, locationId: loc.id } });
  }
  const snap = await prisma.snapshot.create({ data: { deviceId: device.id, ph: parameters.ph, tds: parameters.tds, raw } });
  broadcast({ type: 'snapshot', payload: snap });
  res.json({ ok: true });
});

// POS endpoints (simplified)
app.get('/products', async (req, res) => {
  const tenantId = (req as any).tenantId as string;
  const products = await prisma.product.findMany({ where: { tenantId, active: true } });
  res.json(products);
});

app.post('/sale', async (req, res) => {
  const tenantId = (req as any).tenantId as string;
  const body = z.object({ productId: z.string(), qty: z.number().min(1), method: z.enum(['WATERIANS','WATERCOIN_QR','QRIS','CASH']) }).parse(req.body);
  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product || product.tenantId !== tenantId) return res.status(404).json({ error: 'product not found' });
  const liters = 19 * body.qty;
  const amount = product.price * body.qty;
  const sale = await prisma.sale.create({ data: { tenantId, productId: product.id, quantity: body.qty, liters, amount, payment: body.method as any, result: 'SUCCESS' as any } });
  res.json(sale);
});

// WebSocket for realtime pushes
const wss = new WebSocketServer({ noServer: true });
function broadcast(payload: unknown){
  const data = JSON.stringify(payload);
  wss.clients.forEach(c => { try { (c as any).send(data); } catch {} });
}

const server = app.listen(process.env.PORT ?? 4000, () => log.info(`API listening on ${process.env.PORT ?? 4000}`));
server.on('upgrade', (req, socket, head) => {
  if (req.url !== '/ws') return socket.destroy();
  wss.handleUpgrade(req, socket as any, head, (ws) => wss.emit('connection', ws, req));
});


