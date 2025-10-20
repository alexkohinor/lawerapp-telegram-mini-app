/**
 * API endpoint для получения конкретной AI консультации
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID консультации обязателен' },
        { status: 400 }
      );
    }

    // Получаем консультацию
    const consultation = await prisma.aIConsultation.findUnique({
      where: { id },
      select: {
        id: true,
        query: true,
        response: true,
        confidence: true,
        sources: true,
        createdAt: true,
        userId: true
      }
    });

    if (!consultation) {
      return NextResponse.json(
        { error: 'Консультация не найдена' },
        { status: 404 }
      );
    }

    // Парсим ответ для извлечения структурированных данных
    const parsedResponse = parseConsultationResponse(consultation.response);

    return NextResponse.json({
      success: true,
      consultation: {
        id: consultation.id,
        query: consultation.query,
        response: consultation.response,
        confidence: consultation.confidence,
        sources: consultation.sources,
        suggestions: parsedResponse.suggestions,
        followUpQuestions: parsedResponse.followUpQuestions,
        createdAt: consultation.createdAt
      }
    });

  } catch (error) {
    console.error('Get Consultation API Error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

/**
 * Парсинг ответа консультации для извлечения структурированных данных
 */
function parseConsultationResponse(response: string): {
  suggestions: string[];
  followUpQuestions: string[];
} {
  // Извлекаем предложения
  const suggestionsMatch = response.match(/Предложения:\s*([^\n]+)/);
  const suggestions = suggestionsMatch 
    ? suggestionsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Извлекаем вопросы
  const questionsMatch = response.match(/Вопросы:\s*([^\n]+)/);
  const followUpQuestions = questionsMatch 
    ? questionsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return {
    suggestions,
    followUpQuestions,
  };
}
