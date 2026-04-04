import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function activationEmails(prefix: string, count: number): { email: string }[] {
  return Array.from({ length: count }, (_, i) => ({
    email: `${prefix}-u${i + 1}@seed.example.com`,
  }));
}

async function main(): Promise<void> {
  await prisma.activation.deleteMany();
  await prisma.promocode.deleteMany();

  const expiresValid = daysFromNow(365);
  const expiresSoon = daysFromNow(30);

  // Exhausted: activationCount === limit
  await prisma.$transaction([
    prisma.promocode.create({
      data: {
        code: 'EXHST01',
        discount: 10,
        limit: 5,
        activationCount: 5,
        expiresAt: expiresValid,
        activations: { createMany: { data: activationEmails('exhst01', 5) } },
      },
    }),
    prisma.promocode.create({
      data: {
        code: 'EXHST02',
        discount: 20,
        limit: 3,
        activationCount: 3,
        expiresAt: expiresValid,
        activations: { createMany: { data: activationEmails('exhst02', 3) } },
      },
    }),
    prisma.promocode.create({
      data: {
        code: 'EXHST03',
        discount: 15,
        limit: 10,
        activationCount: 10,
        expiresAt: expiresSoon,
        activations: { createMany: { data: activationEmails('exhst03', 10) } },
      },
    }),
  ]);

  // Expired
  await prisma.$transaction([
    prisma.promocode.create({
      data: {
        code: 'EXP01',
        discount: 5,
        limit: 100,
        activationCount: 0,
        expiresAt: daysFromNow(-1),
      },
    }),
    prisma.promocode.create({
      data: {
        code: 'EXP02',
        discount: 50,
        limit: 10,
        activationCount: 2,
        expiresAt: daysFromNow(-2),
        activations: { createMany: { data: activationEmails('exp02', 2) } },
      },
    }),
    prisma.promocode.create({
      data: {
        code: 'EXP03',
        discount: 100,
        limit: 1,
        activationCount: 1,
        expiresAt: daysFromNow(-3),
        activations: { createMany: { data: activationEmails('exp03', 1) } },
      },
    }),
  ]);

  // Valid: small limits, “infinite”, partial, fresh, discount spread
  await prisma.promocode.createMany({
    data: [
      { code: 'VALID_L1', discount: 1, limit: 1, activationCount: 0, expiresAt: expiresValid },
      { code: 'VALID_L2', discount: 2, limit: 2, activationCount: 0, expiresAt: expiresValid },
      {
        code: 'VALID_BIG',
        discount: 50,
        limit: 1_000_000,
        activationCount: 0,
        expiresAt: expiresValid,
      },
      {
        code: 'VALID_BIG_USED',
        discount: 25,
        limit: 1_000_000,
        activationCount: 100,
        expiresAt: expiresValid,
      },
      {
        code: 'VALID_PARTIAL',
        discount: 33,
        limit: 10,
        activationCount: 5,
        expiresAt: expiresValid,
      },
      { code: 'VALID_NEW_A', discount: 7, limit: 20, activationCount: 0, expiresAt: expiresValid },
      { code: 'VALID_NEW_B', discount: 42, limit: 50, activationCount: 0, expiresAt: expiresValid },
      { code: 'D010', discount: 10, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D020', discount: 20, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D030', discount: 30, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D040', discount: 40, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D060', discount: 60, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D070', discount: 70, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D080', discount: 80, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D090', discount: 90, limit: 500, activationCount: 0, expiresAt: expiresValid },
      { code: 'D100', discount: 100, limit: 500, activationCount: 0, expiresAt: expiresValid },
    ],
  });

  const partial = await prisma.promocode.findUniqueOrThrow({
    where: { code: 'VALID_PARTIAL' },
  });
  await prisma.activation.createMany({
    data: activationEmails('partial', 5).map((row) => ({
      ...row,
      promocodeId: partial.id,
    })),
  });

  const bigUsed = await prisma.promocode.findUniqueOrThrow({
    where: { code: 'VALID_BIG_USED' },
  });
  await prisma.activation.createMany({
    data: activationEmails('bigused', 100).map((row) => ({
      ...row,
      promocodeId: bigUsed.id,
    })),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
