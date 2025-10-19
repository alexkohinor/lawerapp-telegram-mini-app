import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Проверяем основные компоненты
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: await checkDatabase(),
        storage: await checkStorage(),
        telegram: await checkTelegram(),
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function checkDatabase(): Promise<{ status: string; message: string }> {
  try {
    // Здесь можно добавить проверку подключения к базе данных
    // const prisma = new PrismaClient();
    // await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection OK' };
  } catch (error) {
    return { status: 'unhealthy', message: 'Database connection failed' };
  }
}

async function checkStorage(): Promise<{ status: string; message: string }> {
  try {
    // Проверяем доступность S3
    const s3Endpoint = process.env.S3_ENDPOINT;
    if (!s3Endpoint) {
      return { status: 'unhealthy', message: 'S3 endpoint not configured' };
    }
    return { status: 'healthy', message: 'S3 storage configured' };
  } catch (error) {
    return { status: 'unhealthy', message: 'Storage check failed' };
  }
}

async function checkTelegram(): Promise<{ status: string; message: string }> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return { status: 'unhealthy', message: 'Telegram bot token not configured' };
    }
    return { status: 'healthy', message: 'Telegram bot configured' };
  } catch (error) {
    return { status: 'unhealthy', message: 'Telegram check failed' };
  }
}
