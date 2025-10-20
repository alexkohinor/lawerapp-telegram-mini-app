/**
 * API endpoint для управления спорами
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      description, 
      type, 
      priority, 
      estimatedValue, 
      deadline, 
      userId 
    } = await request.json();

    // Валидация входных данных
    if (!title || !description || !type || !userId) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля: title, description, type, userId' },
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

    // Создаем спор
    const dispute = await prisma.dispute.create({
      data: {
        title,
        description,
        type,
        priority: priority || 'medium',
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        deadline: deadline ? new Date(deadline) : null,
        userId
      },
      include: {
        documents: true
      }
    });

    return NextResponse.json({
      success: true,
      dispute
    });

  } catch (error) {
    console.error('Create dispute API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Строим фильтры
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }

    // Получаем споры
    const disputes = await prisma.dispute.findMany({
      where,
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.dispute.count({ where });

    // Статистика
    const stats = await prisma.dispute.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true
      }
    });

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      disputes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: statusStats
    });

  } catch (error) {
    console.error('Get disputes API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}