/**
 * API endpoint для AI консультаций
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLegalConsultation, LegalCategory } from '@/lib/ai/openai-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { query, category, context, userId } = await request.json();

    // Валидация входных данных
    if (!query || !category || !userId) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля: query, category, userId' },
        { status: 400 }
      );
    }

    // Проверяем, что категория валидна
    if (!Object.values(LegalCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Недопустимая категория права' },
        { status: 400 }
      );
    }

    // Проверяем лимиты пользователя (заглушка для бесплатного плана)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // TODO: Реализовать проверку лимитов подписки
    // const consultationCount = await prisma.aIConsultation.count({
    //   where: {
    //     userId,
    //     createdAt: {
    //       gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    //     }
    //   }
    // });

    // if (!user.isPremium && consultationCount >= 5) {
    //   return NextResponse.json(
    //     { error: 'Превышен лимит консультаций для бесплатного плана' },
    //     { status: 429 }
    //   );
    // }

    // Получаем консультацию от AI
    const consultation = await getLegalConsultation({
      query,
      category,
      context,
      userId
    });

    // Сохраняем консультацию в базу данных
    const savedConsultation = await prisma.aIConsultation.create({
      data: {
        query,
        response: consultation.response,
        confidence: consultation.confidence,
        sources: consultation.sources,
        userId
      }
    });

    return NextResponse.json({
      success: true,
      consultation: {
        id: savedConsultation.id,
        query: savedConsultation.query,
        response: savedConsultation.response,
        confidence: savedConsultation.confidence,
        sources: savedConsultation.sources,
        suggestions: consultation.suggestions,
        followUpQuestions: consultation.followUpQuestions,
        createdAt: savedConsultation.createdAt
      }
    });

  } catch (error) {
    console.error('AI Consultation API Error:', error);
    
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'Ошибка AI сервиса. Попробуйте позже.' },
        { status: 503 }
      );
    }

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Получаем историю консультаций пользователя
    const consultations = await prisma.aIConsultation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        query: true,
        response: true,
        confidence: true,
        sources: true,
        createdAt: true
      }
    });

    const total = await prisma.aIConsultation.count({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      consultations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Get Consultations API Error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}