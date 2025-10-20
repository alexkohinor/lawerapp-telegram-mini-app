/**
 * API endpoint для управления статусом спора
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const validStatuses = ['ACTIVE', 'RESOLVED', 'CLOSED', 'ESCALATED', 'PENDING'];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, userId, comment } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Недопустимый статус' },
        { status: 400 }
      );
    }

    // Проверяем, что спор принадлежит пользователю
    const existingDispute = await prisma.dispute.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingDispute) {
      return NextResponse.json(
        { error: 'Спор не найден' },
        { status: 404 }
      );
    }

    // Обновляем статус
    const updatedDispute = await prisma.dispute.update({
      where: { id },
      data: { status },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // TODO: Здесь можно добавить логику для создания записи в timeline
    // или отправки уведомлений при изменении статуса

    return NextResponse.json({
      success: true,
      dispute: updatedDispute,
      message: `Статус изменен на ${status}`
    });

  } catch (error) {
    console.error('Update dispute status API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Получаем текущий статус спора
    const dispute = await prisma.dispute.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true,
        status: true,
        title: true,
        updatedAt: true
      }
    });

    if (!dispute) {
      return NextResponse.json(
        { error: 'Спор не найден' },
        { status: 404 }
      );
    }

    // Возвращаем доступные статусы для перехода
    const availableStatuses = getAvailableStatuses(dispute.status);

    return NextResponse.json({
      success: true,
      currentStatus: dispute.status,
      availableStatuses,
      lastUpdated: dispute.updatedAt
    });

  } catch (error) {
    console.error('Get dispute status API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

function getAvailableStatuses(currentStatus: string) {
  const statusTransitions: Record<string, string[]> = {
    'PENDING': ['ACTIVE', 'CLOSED'],
    'ACTIVE': ['RESOLVED', 'ESCALATED', 'CLOSED'],
    'ESCALATED': ['ACTIVE', 'RESOLVED', 'CLOSED'],
    'RESOLVED': ['ACTIVE', 'CLOSED'],
    'CLOSED': ['ACTIVE'] // Можно переоткрыть закрытый спор
  };

  return statusTransitions[currentStatus] || [];
}
