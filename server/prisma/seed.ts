import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const apiKey = process.env.SEED_API_KEY || 'dev-key';
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const tenant = await prisma.tenant.upsert({
    where: { id: 'seed-tenant' },
    update: {},
    create: { id: 'seed-tenant', name: 'Watercoin Makmur', apiKeyHash: hash }
  });

  await prisma.location.upsert({
    where: { id: 'seed-location' },
    update: {},
    create: { id: 'seed-location', name: 'Default', tenantId: tenant.id }
  });

  const products = [
    { name: 'AIR RO 19L', price: 6000 },
    { name: 'GALON 19L AQUA', price: 20000 },
    { name: 'GALON 19L CLEO', price: 18000 },
    { name: 'GALON PERTAMA', price: 65000 }
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: `seed-${p.name}` },
      update: { name: p.name, price: p.price, tenantId: tenant.id, active: true },
      create: { id: `seed-${p.name}`, name: p.name, price: p.price, tenantId: tenant.id }
    });
  }

  console.log('Seed complete. Use API key:', apiKey);
}

main().finally(() => prisma.$disconnect());


