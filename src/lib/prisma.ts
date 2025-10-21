/**
 * Prisma Client - типобезопасный доступ к базе данных
 * Настроен для работы с PostgreSQL в TimeWeb Cloud
 */

import { PrismaClient } from '@prisma/client';

// Глобальная переменная для предотвращения создания множественных экземпляров
// в development режиме при hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Создаем экземпляр Prisma Client с настройками
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  errorFormat: 'pretty',
});

// В development режиме сохраняем экземпляр в глобальной переменной
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Логирование запросов в development режиме
if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error - Prisma event types issue
  prisma.$on('query', (e: unknown) => {
    console.log('Query: ' + (e as Record<string, unknown>).query);
    console.log('Params: ' + (e as Record<string, unknown>).params);
    console.log('Duration: ' + (e as Record<string, unknown>).duration + 'ms');
  });

  // @ts-expect-error - Prisma event types issue
  prisma.$on('error', (e: unknown) => {
    console.error('Prisma Error:', e);
  });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
