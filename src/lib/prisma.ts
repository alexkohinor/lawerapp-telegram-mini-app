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
  prisma.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  });

  prisma.$on('error', (e) => {
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
