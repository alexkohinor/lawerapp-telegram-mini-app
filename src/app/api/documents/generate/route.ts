/**
 * API endpoint для генерации документов
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDocument, validateDocumentData, DocumentType } from '@/lib/documents/generator';
import { generateLegalDocumentPDF } from '@/lib/documents/pdf-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { type, data, userId, title } = await request.json();

    // Валидация входных данных
    if (!type || !data || !userId) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля: type, data, userId' },
        { status: 400 }
      );
    }

    // Проверяем, что тип документа валиден
    const validTypes: DocumentType[] = ['pretenziya', 'isk', 'dogovor', 'soglashenie'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Недопустимый тип документа' },
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

    // Валидируем данные документа
    const validation = validateDocumentData(type, data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Ошибки валидации', details: validation.errors },
        { status: 400 }
      );
    }

    // TODO: Проверка лимитов подписки
    // const documentCount = await prisma.document.count({
    //   where: {
    //     userId,
    //     createdAt: {
    //       gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    //     }
    //   }
    // });

    // if (!user.isPremium && documentCount >= 3) {
    //   return NextResponse.json(
    //     { error: 'Превышен лимит документов для бесплатного плана' },
    //     { status: 429 }
    //   );
    // }

    // Генерируем документ
    const documentText = generateDocument(type, data);
    
    // Генерируем PDF
    const pdfResult = generateLegalDocumentPDF(
      documentText,
      title || `Документ ${type}`,
      {
        title: title || `Документ ${type}`,
        author: 'LawerApp',
        subject: 'Правовой документ',
        keywords: 'документ, право, закон, юридический'
      }
    );

    if (!pdfResult.success) {
      return NextResponse.json(
        { error: 'Ошибка генерации PDF', details: pdfResult.error },
        { status: 500 }
      );
    }

    // Сохраняем документ в базу данных
    const savedDocument = await prisma.document.create({
      data: {
        title: title || `Документ ${type}`,
        content: documentText,
        type: type.toUpperCase(),
        metadata: {
          originalData: data,
          generatedAt: new Date().toISOString(),
          pdfSize: pdfResult.pdfBlob?.size || 0
        },
        userId
      }
    });

    // Конвертируем PDF Blob в base64 для передачи
    const pdfBase64 = pdfResult.pdfBlob ? 
      Buffer.from(await pdfResult.pdfBlob.arrayBuffer()).toString('base64') : 
      null;

    return NextResponse.json({
      success: true,
      document: {
        id: savedDocument.id,
        title: savedDocument.title,
        type: savedDocument.type,
        content: savedDocument.content,
        createdAt: savedDocument.createdAt,
        pdfBase64,
        pdfSize: pdfResult.pdfBlob?.size || 0
      }
    });

  } catch (error) {
    console.error('Document generation API error:', error);
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

    // Получаем список документов пользователя
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        type: true,
        content: true,
        metadata: true,
        createdAt: true
      }
    });

    const total = await prisma.document.count({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      documents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Get documents API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}