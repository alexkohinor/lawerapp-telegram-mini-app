import { jsPDF } from 'jspdf';
// @ts-expect-error - jsPDF font plugin
import 'jspdf/dist/polyfills.es.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Сервис экспорта налоговых документов в PDF и DOCX
 * С загрузкой в S3 для хранения
 */

export interface DocumentExportOptions {
  documentId: string;
  title: string;
  content: string;
  format: 'pdf' | 'docx';
  metadata?: {
    taxpayerName?: string;
    taxType?: string;
    period?: string;
    generatedAt?: Date;
  };
}

export interface ExportResult {
  success: boolean;
  s3Key?: string;
  s3Url?: string;
  fileSize?: number;
  error?: string;
}

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
 * Экспорт документа в PDF
 */
export async function exportToPDF(options: DocumentExportOptions): Promise<ExportResult> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Настройки документа
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;
    
    // Добавляем заголовок
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(options.title, contentWidth);
    pdf.text(titleLines, margin, currentY);
    currentY += titleLines.length * 7 + 10;
    
    // Добавляем метаданные
    if (options.metadata) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (options.metadata.taxpayerName) {
        pdf.text(`Налогоплательщик: ${options.metadata.taxpayerName}`, margin, currentY);
        currentY += 5;
      }
      
      if (options.metadata.taxType) {
        pdf.text(`Вид налога: ${options.metadata.taxType}`, margin, currentY);
        currentY += 5;
      }
      
      if (options.metadata.period) {
        pdf.text(`Период: ${options.metadata.period}`, margin, currentY);
        currentY += 5;
      }
      
      if (options.metadata.generatedAt) {
        pdf.text(`Дата генерации: ${options.metadata.generatedAt.toLocaleDateString('ru-RU')}`, margin, currentY);
        currentY += 10;
      }
    }
    
    // Добавляем линию-разделитель
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    // Добавляем основное содержимое
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const contentLines = options.content.split('\n');
    
    for (const line of contentLines) {
      // Проверка на конец страницы
      if (currentY > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
      
      // Обработка заголовков (строки в верхнем регистре)
      if (line === line.toUpperCase() && line.trim().length > 0 && line.length < 100) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
      }
      
      // Разбивка длинных строк
      const wrappedLines = pdf.splitTextToSize(line || ' ', contentWidth);
      
      for (const wrappedLine of wrappedLines) {
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.text(wrappedLine, margin, currentY);
        currentY += 6;
      }
    }
    
    // Конвертация в Buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    
    // Загрузка в S3
    const s3Key = `tax-documents/${options.documentId}.pdf`;
    const uploadResult = await uploadToS3(pdfBuffer, s3Key, 'application/pdf');
    
    return {
      success: true,
      s3Key: uploadResult.s3Key,
      s3Url: uploadResult.s3Url,
      fileSize: pdfBuffer.length,
    };
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Экспорт документа в DOCX
 * Для простоты используем RTF формат, который читается Word
 */
export async function exportToDOCX(options: DocumentExportOptions): Promise<ExportResult> {
  try {
    // Генерируем RTF документ (совместим с DOCX)
    let rtfContent = '{\\rtf1\\ansi\\deff0\n';
    
    // Шрифты
    rtfContent += '{\\fonttbl{\\f0\\froman\\fcharset204 Times New Roman;}}\n';
    
    // Заголовок
    rtfContent += '{\\b\\fs32 ' + escapeRTF(options.title) + '}\\par\\par\n';
    
    // Метаданные
    if (options.metadata) {
      rtfContent += '{\\fs20\n';
      
      if (options.metadata.taxpayerName) {
        rtfContent += 'Налогоплательщик: ' + escapeRTF(options.metadata.taxpayerName) + '\\par\n';
      }
      
      if (options.metadata.taxType) {
        rtfContent += 'Вид налога: ' + escapeRTF(options.metadata.taxType) + '\\par\n';
      }
      
      if (options.metadata.period) {
        rtfContent += 'Период: ' + escapeRTF(options.metadata.period) + '\\par\n';
      }
      
      if (options.metadata.generatedAt) {
        rtfContent += 'Дата генерации: ' + escapeRTF(options.metadata.generatedAt.toLocaleDateString('ru-RU')) + '\\par\n';
      }
      
      rtfContent += '}\\par\\par\n';
    }
    
    // Разделитель
    rtfContent += '\\brdrb\\brdrs\\brdrw15\\brsp20\\par\\par\n';
    
    // Основное содержимое
    rtfContent += '{\\fs22\n';
    
    const contentLines = options.content.split('\n');
    
    for (const line of contentLines) {
      if (line.trim().length === 0) {
        rtfContent += '\\par\n';
        continue;
      }
      
      // Заголовки (строки в верхнем регистре)
      if (line === line.toUpperCase() && line.length < 100) {
        rtfContent += '{\\b\\fs24 ' + escapeRTF(line) + '}\\par\\par\n';
      } else {
        rtfContent += escapeRTF(line) + '\\par\n';
      }
    }
    
    rtfContent += '}\n';
    rtfContent += '}';
    
    // Конвертация в Buffer
    const docxBuffer = Buffer.from(rtfContent, 'utf-8');
    
    // Загрузка в S3 (сохраняем как .rtf, но он откроется в Word)
    const s3Key = `tax-documents/${options.documentId}.docx`;
    const uploadResult = await uploadToS3(docxBuffer, s3Key, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    return {
      success: true,
      s3Key: uploadResult.s3Key,
      s3Url: uploadResult.s3Url,
      fileSize: docxBuffer.length,
    };
    
  } catch (error) {
    console.error('DOCX Export Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Загрузка файла в S3
 */
async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<{ s3Key: string; s3Url: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private', // Приватный доступ
    });
    
    await s3Client.send(command);
    
    // Формирование URL (для приватных файлов нужен signed URL, но пока просто path)
    const s3Url = `${process.env.S3_ENDPOINT}/${S3_BUCKET}/${key}`;
    
    return {
      s3Key: key,
      s3Url,
    };
    
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw error;
  }
}

/**
 * Экранирование специальных символов для RTF
 */
function escapeRTF(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par\n');
}

/**
 * Экспорт документа (универсальная функция)
 */
export async function exportDocument(options: DocumentExportOptions): Promise<ExportResult> {
  if (options.format === 'pdf') {
    return await exportToPDF(options);
  } else if (options.format === 'docx') {
    return await exportToDOCX(options);
  } else {
    return {
      success: false,
      error: `Unsupported format: ${options.format}`,
    };
  }
}

