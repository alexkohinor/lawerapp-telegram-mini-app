/**
 * API endpoint для работы с конкретным спором
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Получаем спор
    const dispute = await prisma.dispute.findFirst({
      where: {
        id,
        userId
      },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!dispute) {
      return NextResponse.json(
        { error: 'Спор не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dispute
    });

  } catch (error) {
    console.error('Get dispute API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { 
      title, 
      description, 
      type, 
      status, 
      priority, 
      estimatedValue, 
      deadline, 
      userId 
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
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

    // Обновляем спор
    const updatedDispute = await prisma.dispute.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(type && { type }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(estimatedValue !== undefined && { estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null })
      },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      dispute: updatedDispute
    });

  } catch (error) {
    console.error('Update dispute API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Удаляем спор (документы удалятся каскадно)
    await prisma.dispute.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Спор успешно удален'
    });

  } catch (error) {
    console.error('Delete dispute API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}