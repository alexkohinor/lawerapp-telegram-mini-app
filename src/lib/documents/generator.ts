/**
 * Генератор документов
 */

import { generatePretenziya, PretenziyaData } from './templates/pretenziya-template';
import { generateIsk, IskData } from './templates/isk-template';
import { generateDogovor, DogovorData } from './templates/dogovor-template';
import { generateSoglashenie, SoglashenieData } from './templates/soglashenie-template';

export type DocumentType = 'pretenziya' | 'isk' | 'dogovor' | 'soglashenie';

export type DocumentData = PretenziyaData | IskData | DogovorData | SoglashenieData;

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  category: string;
  icon: string;
  fields: DocumentField[];
}

export interface DocumentField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'pretenziya',
    name: 'Претензия',
    description: 'Претензия по защите прав потребителей',
    type: 'pretenziya',
    category: 'Защита прав потребителей',
    icon: '📋',
    fields: [
      {
        id: 'consumerName',
        name: 'consumerName',
        type: 'text',
        label: 'Ваше ФИО',
        placeholder: 'Иванов Иван Иванович',
        required: true
      },
      {
        id: 'consumerAddress',
        name: 'consumerAddress',
        type: 'textarea',
        label: 'Ваш адрес',
        placeholder: 'г. Москва, ул. Примерная, д. 1, кв. 1',
        required: true
      },
      {
        id: 'consumerPhone',
        name: 'consumerPhone',
        type: 'phone',
        label: 'Ваш телефон',
        placeholder: '+7 (999) 123-45-67',
        required: true
      },
      {
        id: 'consumerEmail',
        name: 'consumerEmail',
        type: 'email',
        label: 'Ваш email (необязательно)',
        placeholder: 'example@email.com',
        required: false
      },
      {
        id: 'sellerName',
        name: 'sellerName',
        type: 'text',
        label: 'Название продавца/исполнителя',
        placeholder: 'ООО "Пример"',
        required: true
      },
      {
        id: 'sellerAddress',
        name: 'sellerAddress',
        type: 'textarea',
        label: 'Адрес продавца',
        placeholder: 'г. Москва, ул. Торговая, д. 10',
        required: true
      },
      {
        id: 'productName',
        name: 'productName',
        type: 'text',
        label: 'Название товара/услуги',
        placeholder: 'Смартфон iPhone 15',
        required: true
      },
      {
        id: 'productDescription',
        name: 'productDescription',
        type: 'textarea',
        label: 'Описание товара/услуги',
        placeholder: 'Смартфон Apple iPhone 15, 128 ГБ, синий',
        required: true
      },
      {
        id: 'purchaseDate',
        name: 'purchaseDate',
        type: 'date',
        label: 'Дата покупки',
        required: true
      },
      {
        id: 'purchasePrice',
        name: 'purchasePrice',
        type: 'number',
        label: 'Цена покупки (руб.)',
        placeholder: '50000',
        required: true,
        validation: {
          min: 1,
          message: 'Цена должна быть больше 0'
        }
      },
      {
        id: 'defectType',
        name: 'defectType',
        type: 'select',
        label: 'Тип недостатка',
        required: true,
        options: ['качество', 'комплектность', 'безопасность', 'другое']
      },
      {
        id: 'defectDescription',
        name: 'defectDescription',
        type: 'textarea',
        label: 'Описание недостатка',
        placeholder: 'Подробно опишите обнаруженный недостаток',
        required: true
      },
      {
        id: 'requirements',
        name: 'requirements',
        type: 'multiselect',
        label: 'Ваши требования',
        required: true,
        options: ['возврат', 'замена', 'устранение', 'снижение_цены', 'возмещение_ущерба']
      },
      {
        id: 'responseDeadline',
        name: 'responseDeadline',
        type: 'select',
        label: 'Срок для ответа (дней)',
        required: true,
        options: ['10', '14', '30']
      }
    ]
  },
  {
    id: 'isk',
    name: 'Исковое заявление',
    description: 'Исковое заявление в суд',
    type: 'isk',
    category: 'Судебные документы',
    icon: '⚖️',
    fields: [
      {
        id: 'plaintiffName',
        name: 'plaintiffName',
        type: 'text',
        label: 'ФИО истца',
        placeholder: 'Иванов Иван Иванович',
        required: true
      },
      {
        id: 'plaintiffAddress',
        name: 'plaintiffAddress',
        type: 'textarea',
        label: 'Адрес истца',
        placeholder: 'г. Москва, ул. Примерная, д. 1, кв. 1',
        required: true
      },
      {
        id: 'plaintiffPhone',
        name: 'plaintiffPhone',
        type: 'phone',
        label: 'Телефон истца',
        placeholder: '+7 (999) 123-45-67',
        required: true
      },
      {
        id: 'defendantName',
        name: 'defendantName',
        type: 'text',
        label: 'ФИО/название ответчика',
        placeholder: 'Петров Петр Петрович',
        required: true
      },
      {
        id: 'defendantAddress',
        name: 'defendantAddress',
        type: 'textarea',
        label: 'Адрес ответчика',
        placeholder: 'г. Москва, ул. Ответная, д. 2',
        required: true
      },
      {
        id: 'disputeType',
        name: 'disputeType',
        type: 'select',
        label: 'Тип спора',
        required: true,
        options: ['потребительский', 'трудовой', 'жилищный', 'семейный', 'гражданский']
      },
      {
        id: 'disputeDescription',
        name: 'disputeDescription',
        type: 'textarea',
        label: 'Описание спора',
        placeholder: 'Подробно опишите суть спора',
        required: true
      },
      {
        id: 'disputeAmount',
        name: 'disputeAmount',
        type: 'number',
        label: 'Сумма иска (руб.)',
        placeholder: '100000',
        required: true,
        validation: {
          min: 1,
          message: 'Сумма должна быть больше 0'
        }
      },
      {
        id: 'courtName',
        name: 'courtName',
        type: 'text',
        label: 'Название суда',
        placeholder: 'Московский городской суд',
        required: true
      }
    ]
  },
  {
    id: 'dogovor',
    name: 'Договор',
    description: 'Договор между сторонами',
    type: 'dogovor',
    category: 'Договорное право',
    icon: '📄',
    fields: [
      {
        id: 'contractType',
        name: 'contractType',
        type: 'select',
        label: 'Тип договора',
        required: true,
        options: ['купли_продажи', 'оказания_услуг', 'аренды', 'подряда', 'займа']
      },
      {
        id: 'party1Name',
        name: 'party1Name',
        type: 'text',
        label: 'ФИО/название стороны 1',
        placeholder: 'Иванов Иван Иванович',
        required: true
      },
      {
        id: 'party1Address',
        name: 'party1Address',
        type: 'textarea',
        label: 'Адрес стороны 1',
        placeholder: 'г. Москва, ул. Примерная, д. 1',
        required: true
      },
      {
        id: 'party1Phone',
        name: 'party1Phone',
        type: 'phone',
        label: 'Телефон стороны 1',
        placeholder: '+7 (999) 123-45-67',
        required: true
      },
      {
        id: 'party2Name',
        name: 'party2Name',
        type: 'text',
        label: 'ФИО/название стороны 2',
        placeholder: 'Петров Петр Петрович',
        required: true
      },
      {
        id: 'party2Address',
        name: 'party2Address',
        type: 'textarea',
        label: 'Адрес стороны 2',
        placeholder: 'г. Москва, ул. Ответная, д. 2',
        required: true
      },
      {
        id: 'party2Phone',
        name: 'party2Phone',
        type: 'phone',
        label: 'Телефон стороны 2',
        placeholder: '+7 (999) 765-43-21',
        required: true
      },
      {
        id: 'subject',
        name: 'subject',
        type: 'text',
        label: 'Предмет договора',
        placeholder: 'Оказание услуг по разработке сайта',
        required: true
      },
      {
        id: 'description',
        name: 'description',
        type: 'textarea',
        label: 'Описание предмета',
        placeholder: 'Подробное описание предмета договора',
        required: true
      },
      {
        id: 'price',
        name: 'price',
        type: 'number',
        label: 'Цена (руб.)',
        placeholder: '50000',
        required: true,
        validation: {
          min: 1,
          message: 'Цена должна быть больше 0'
        }
      },
      {
        id: 'paymentTerms',
        name: 'paymentTerms',
        type: 'textarea',
        label: 'Условия оплаты',
        placeholder: 'Оплата производится в течение 10 дней после подписания договора',
        required: true
      },
      {
        id: 'contractStartDate',
        name: 'contractStartDate',
        type: 'date',
        label: 'Дата начала действия договора',
        required: true
      }
    ]
  },
  {
    id: 'soglashenie',
    name: 'Соглашение',
    description: 'Соглашение между сторонами',
    type: 'soglashenie',
    category: 'Соглашения',
    icon: '🤝',
    fields: [
      {
        id: 'agreementType',
        name: 'agreementType',
        type: 'select',
        label: 'Тип соглашения',
        required: true,
        options: ['мировое', 'о_разделе_имущества', 'об_алиментах', 'о_расторжении_договора', 'о_возмещении_ущерба']
      },
      {
        id: 'party1Name',
        name: 'party1Name',
        type: 'text',
        label: 'ФИО/название стороны 1',
        placeholder: 'Иванов Иван Иванович',
        required: true
      },
      {
        id: 'party1Address',
        name: 'party1Address',
        type: 'textarea',
        label: 'Адрес стороны 1',
        placeholder: 'г. Москва, ул. Примерная, д. 1',
        required: true
      },
      {
        id: 'party1Phone',
        name: 'party1Phone',
        type: 'phone',
        label: 'Телефон стороны 1',
        placeholder: '+7 (999) 123-45-67',
        required: true
      },
      {
        id: 'party2Name',
        name: 'party2Name',
        type: 'text',
        label: 'ФИО/название стороны 2',
        placeholder: 'Петров Петр Петрович',
        required: true
      },
      {
        id: 'party2Address',
        name: 'party2Address',
        type: 'textarea',
        label: 'Адрес стороны 2',
        placeholder: 'г. Москва, ул. Ответная, д. 2',
        required: true
      },
      {
        id: 'party2Phone',
        name: 'party2Phone',
        type: 'phone',
        label: 'Телефон стороны 2',
        placeholder: '+7 (999) 765-43-21',
        required: true
      },
      {
        id: 'subject',
        name: 'subject',
        type: 'text',
        label: 'Предмет соглашения',
        placeholder: 'Урегулирование спора о разделе имущества',
        required: true
      },
      {
        id: 'description',
        name: 'description',
        type: 'textarea',
        label: 'Описание предмета',
        placeholder: 'Подробное описание предмета соглашения',
        required: true
      },
      {
        id: 'amount',
        name: 'amount',
        type: 'number',
        label: 'Сумма соглашения (руб.)',
        placeholder: '100000',
        required: false,
        validation: {
          min: 1,
          message: 'Сумма должна быть больше 0'
        }
      },
      {
        id: 'agreementStartDate',
        name: 'agreementStartDate',
        type: 'date',
        label: 'Дата начала действия соглашения',
        required: true
      }
    ]
  }
];

/**
 * Получить шаблон документа по типу
 */
export function getDocumentTemplate(type: DocumentType): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find(template => template.type === type);
}

/**
 * Получить все шаблоны документов
 */
export function getAllDocumentTemplates(): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES;
}

/**
 * Получить шаблоны по категории
 */
export function getTemplatesByCategory(category: string): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(template => template.category === category);
}

/**
 * Сгенерировать документ
 */
export function generateDocument(type: DocumentType, data: DocumentData): string {
  switch (type) {
    case 'pretenziya':
      return generatePretenziya(data as PretenziyaData);
    case 'isk':
      return generateIsk(data as IskData);
    case 'dogovor':
      return generateDogovor(data as DogovorData);
    case 'soglashenie':
      return generateSoglashenie(data as SoglashenieData);
    default:
      throw new Error(`Неизвестный тип документа: ${type}`);
  }
}

/**
 * Валидация данных документа
 */
export function validateDocumentData(type: DocumentType, data: any): { isValid: boolean; errors: string[] } {
  const template = getDocumentTemplate(type);
  if (!template) {
    return { isValid: false, errors: ['Шаблон документа не найден'] };
  }

  const errors: string[] = [];

  for (const field of template.fields) {
    if (field.required && (!data[field.name] || data[field.name].toString().trim() === '')) {
      errors.push(`Поле "${field.label}" обязательно для заполнения`);
    }

    if (data[field.name] && field.validation) {
      const value = data[field.name];
      
      if (field.type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`Поле "${field.label}" должно содержать число`);
        } else {
          if (field.validation.min !== undefined && numValue < field.validation.min) {
            errors.push(field.validation.message || `Поле "${field.label}" должно быть не менее ${field.validation.min}`);
          }
          if (field.validation.max !== undefined && numValue > field.validation.max) {
            errors.push(field.validation.message || `Поле "${field.label}" должно быть не более ${field.validation.max}`);
          }
        }
      }

      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`Поле "${field.label}" должно содержать корректный email`);
        }
      }

      if (field.type === 'phone' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
          errors.push(`Поле "${field.label}" должно содержать корректный номер телефона`);
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}
