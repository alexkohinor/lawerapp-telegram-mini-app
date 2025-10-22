import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Инициализация S3 клиента
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'ru-1',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.timeweb.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
});

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'lawerapp-documents';

/**
 * GET /api/tax/documents/[id]/download
 * Получение подписанного URL для скачивания документа из S3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const documentId = resolvedParams.id;
    
    // Получение документа
    const document = await prisma.taxDisputeDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        s3Key: true,
        disputeId: true,
        type: true,
      },
    });
    
    if (!document) {
      return NextResponse.json({
        success: false,
        message: 'Document not found',
      }, { status: 404 });
    }
    
    if (!document.s3Key) {
      return NextResponse.json({
        success: false,
        message: 'Document has not been exported yet',
      }, { status: 400 });
    }
    
    // Генерация подписанного URL (действителен 1 час)
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: document.s3Key,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 час
    });
    
    // Логирование скачивания в таймлайн
    await prisma.taxDisputeTimeline.create({
      data: {
        disputeId: document.disputeId,
        eventType: 'document_downloaded',
        description: `Документ "${document.title}" скачан`,
        metadata: {
          documentId: document.id,
          documentType: document.type,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl,
      expiresIn: 3600,
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        format: document.s3Key.endsWith('.pdf') ? 'pdf' : 'docx',
      },
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

