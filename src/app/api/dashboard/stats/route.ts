/**
 * API endpoint для получения статистики дашборда
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Проверяем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Получаем текущую дату для фильтрации по месяцам
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Статистика консультаций
    const [consultationsTotal, consultationsThisMonth, consultationsPending] = await Promise.all([
      prisma.aIConsultation.count({
        where: { userId }
      }),
      prisma.aIConsultation.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.aIConsultation.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
          // Предполагаем, что консультации без response - pending
          response: { equals: '' }
        }
      })
    ]);

    // Статистика документов
    const [documentsTotal, documentsThisMonth] = await Promise.all([
      prisma.document.count({
        where: { userId }
      }),
      prisma.document.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth }
        }
      })
    ]);

    // Статистика документов по типам
    const documentsByType = await prisma.document.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true }
    });

    const documentsByTypeMap = documentsByType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    // Статистика споров
    const [disputesTotal, disputesActive, disputesResolved, disputesEscalated] = await Promise.all([
      prisma.dispute.count({
        where: { userId }
      }),
      prisma.dispute.count({
        where: { userId, status: 'ACTIVE' }
      }),
      prisma.dispute.count({
        where: { userId, status: 'RESOLVED' }
      }),
      prisma.dispute.count({
        where: { userId, status: 'ESCALATED' }
      })
    ]);

    // Определяем план подписки (пока заглушка)
    const subscriptionPlan = user.isPremium ? 'PREMIUM' : 'FREE';
    
    // Лимиты в зависимости от плана
    const limits = {
      FREE: { consultations: 5, documents: 3 },
      PREMIUM: { consultations: 50, documents: 20 },
      BUSINESS: { consultations: 200, documents: 100 }
    };

    const currentLimits = limits[subscriptionPlan as keyof typeof limits] || limits.FREE;

    // Последняя активность (последние 10 действий)
    const recentActivities = await Promise.all([
      // Последние консультации
      prisma.aIConsultation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          query: true,
          response: true,
          category: true,
          createdAt: true
        }
      }),
      // Последние документы
      prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true
        }
      }),
      // Последние споры
      prisma.dispute.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          type: true,
          createdAt: true
        }
      })
    ]);

    // Формируем единый массив активности
    const activities = [
      ...recentActivities[0].map(consultation => ({
        id: `consultation-${consultation.id}`,
        type: 'consultation' as const,
        title: consultation.query.substring(0, 50) + (consultation.query.length > 50 ? '...' : ''),
        description: consultation.category || 'AI Консультация',
        status: consultation.response ? 'completed' as const : 'pending' as const,
        timestamp: consultation.createdAt.toISOString(),
        metadata: { category: consultation.category }
      })),
      ...recentActivities[1].map(document => ({
        id: `document-${document.id}`,
        type: 'document' as const,
        title: document.title,
        description: `Документ типа ${document.type}`,
        status: 'completed' as const,
        timestamp: document.createdAt.toISOString(),
        metadata: { documentType: document.type }
      })),
      ...recentActivities[2].map(dispute => ({
        id: `dispute-${dispute.id}`,
        type: 'dispute' as const,
        title: dispute.title,
        description: `Спор типа ${dispute.type}`,
        status: dispute.status === 'ACTIVE' ? 'in_progress' as const : 
                dispute.status === 'RESOLVED' ? 'completed' as const : 'pending' as const,
        timestamp: dispute.createdAt.toISOString(),
        metadata: { disputeStatus: dispute.status }
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

    // Статистика использования лимитов
    const usageStats = {
      consultationsUsed: consultationsThisMonth,
      consultationsLimit: currentLimits.consultations,
      documentsUsed: documentsThisMonth,
      documentsLimit: currentLimits.documents
    };

    return NextResponse.json({
      success: true,
      stats: {
        consultations: {
          total: consultationsTotal,
          thisMonth: consultationsThisMonth,
          pending: consultationsPending
        },
        documents: {
          total: documentsTotal,
          thisMonth: documentsThisMonth,
          byType: documentsByTypeMap
        },
        disputes: {
          total: disputesTotal,
          active: disputesActive,
          resolved: disputesResolved,
          escalated: disputesEscalated
        },
        subscription: {
          plan: subscriptionPlan,
          ...usageStats
        }
      },
      activities,
      userStats: {
        consultationsThisMonth,
        documentsThisMonth,
        activeDisputes: disputesActive
      }
    });

  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
