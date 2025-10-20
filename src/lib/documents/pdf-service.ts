/**
 * Сервис для генерации PDF документов
 */

import jsPDF from 'jspdf';

export interface PDFOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  fontSize?: number;
  lineHeight?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: string;
}

/**
 * Генерация PDF из текста документа
 */
export function generatePDFFromText(
  text: string,
  options: PDFOptions = {}
): PDFGenerationResult {
  try {
    const {
      title = 'Документ',
      author = 'LawerApp',
      subject = 'Правовой документ',
      keywords = 'документ, право, закон',
      fontSize = 12,
      lineHeight = 1.5,
      margin = { top: 20, right: 20, bottom: 20, left: 20 }
    } = options;

    // Создаем новый PDF документ
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Устанавливаем метаданные
    doc.setProperties({
      title,
      author,
      subject,
      keywords
    });

    // Настройки шрифта
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');

    // Размеры страницы
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin.left - margin.right;
    const contentHeight = pageHeight - margin.top - margin.bottom;

    // Разбиваем текст на строки
    const lines = doc.splitTextToSize(text, contentWidth);
    
    let yPosition = margin.top;
    const lineHeightPx = fontSize * lineHeight;

    // Добавляем текст на страницы
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Проверяем, помещается ли строка на текущей странице
      if (yPosition + lineHeightPx > pageHeight - margin.bottom) {
        // Добавляем новую страницу
        doc.addPage();
        yPosition = margin.top;
      }

      // Добавляем строку
      doc.text(line, margin.left, yPosition);
      yPosition += lineHeightPx;
    }

    // Генерируем Blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      success: true,
      pdfBlob,
      pdfUrl
    };

  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при генерации PDF'
    };
  }
}

/**
 * Генерация PDF с форматированием для юридических документов
 */
export function generateLegalDocumentPDF(
  text: string,
  documentType: string,
  options: PDFOptions = {}
): PDFGenerationResult {
  try {
    const {
      title = `Документ: ${documentType}`,
      author = 'LawerApp',
      subject = 'Правовой документ',
      keywords = 'документ, право, закон, юридический',
      fontSize = 11,
      lineHeight = 1.4,
      margin = { top: 25, right: 20, bottom: 25, left: 25 }
    } = options;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Метаданные
    doc.setProperties({
      title,
      author,
      subject,
      keywords
    });

    // Размеры страницы
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin.left - margin.right;

    // Заголовок документа
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(documentType.toUpperCase(), contentWidth);
    doc.text(titleLines, margin.left, margin.top);
    
    let yPosition = margin.top + (titleLines.length * 14 * 1.2) + 10;

    // Основной текст
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeightPx = fontSize * lineHeight;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (yPosition + lineHeightPx > pageHeight - margin.bottom) {
        doc.addPage();
        yPosition = margin.top;
      }

      doc.text(line, margin.left, yPosition);
      yPosition += lineHeightPx;
    }

    // Добавляем подпись в конце
    yPosition += 20;
    if (yPosition + 30 > pageHeight - margin.bottom) {
      doc.addPage();
      yPosition = margin.top;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Сгенерировано с помощью LawerApp', margin.left, yPosition);
    doc.text(new Date().toLocaleDateString('ru-RU'), pageWidth - margin.right - 30, yPosition);

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      success: true,
      pdfBlob,
      pdfUrl
    };

  } catch (error) {
    console.error('Legal PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при генерации PDF'
    };
  }
}

/**
 * Скачивание PDF файла
 */
export function downloadPDF(pdfBlob: Blob, filename: string): void {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Предпросмотр PDF в новом окне
 */
export function previewPDF(pdfUrl: string): void {
  window.open(pdfUrl, '_blank');
}

/**
 * Получение размера PDF в байтах
 */
export function getPDFSize(pdfBlob: Blob): number {
  return pdfBlob.size;
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
