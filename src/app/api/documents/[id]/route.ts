/**
 * API endpoint для работы с конкретным документом
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateLegalDocumentPDF } from '@/lib/documents/pdf-service';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const format = searchParams.get('format'); // 'json' | 'pdf'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Получаем документ
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    // Если запрашивается PDF
    if (format === 'pdf') {
      const pdfResult = generateLegalDocumentPDF(
        document.content,
        document.title,
        {
          title: document.title,
          author: 'LawerApp',
          subject: 'Правовой документ',
          keywords: 'документ, право, закон, юридический'
        }
      );

      if (!pdfResult.success || !pdfResult.pdfBlob) {
        return NextResponse.json(
          { error: 'Ошибка генерации PDF' },
          { status: 500 }
        );
      }

      const pdfBuffer = Buffer.from(await pdfResult.pdfBlob.arrayBuffer());
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${document.title}.pdf"`,
          'Content-Length': pdfBuffer.length.toString()
        }
      });
    }

    // Возвращаем JSON
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        content: document.content,
        type: document.type,
        metadata: document.metadata,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });

  } catch (error) {
    console.error('Get document API error:', error);
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
    const { title, content, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      );
    }

    // Проверяем, что документ принадлежит пользователю
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    // Обновляем документ
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        metadata: {
          ...existingDocument.metadata as Record<string, unknown>,
          updatedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument.id,
        title: updatedDocument.title,
        content: updatedDocument.content,
        type: updatedDocument.type,
        metadata: updatedDocument.metadata,
        createdAt: updatedDocument.createdAt,
        updatedAt: updatedDocument.updatedAt
      }
    });

  } catch (error) {
    console.error('Update document API error:', error);
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

    // Проверяем, что документ принадлежит пользователю
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      );
    }

    // Удаляем документ
    await prisma.document.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Документ успешно удален'
    });

  } catch (error) {
    console.error('Delete document API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
