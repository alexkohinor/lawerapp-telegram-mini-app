/**
 * Шаблон искового заявления
 */

export interface IskData {
  // Данные истца
  plaintiffName: string;
  plaintiffAddress: string;
  plaintiffPhone: string;
  plaintiffEmail?: string;
  
  // Данные ответчика
  defendantName: string;
  defendantAddress: string;
  defendantPhone?: string;
  
  // Данные о споре
  disputeType: 'потребительский' | 'трудовой' | 'жилищный' | 'семейный' | 'гражданский';
  disputeDescription: string;
  disputeAmount: number;
  
  // Правовые основания
  legalBasis: string[];
  
  // Требования
  claims: string[];
  
  // Доказательства
  evidence: string[];
  
  // Сроки
  date: string;
  courtName: string;
}

export const ISK_TEMPLATE = `
ИСКОВОЕ ЗАЯВЛЕНИЕ

В ${'[СУД]'}

Истец: ${'[ИСТЕЦ]'}
Адрес: ${'[АДРЕС_ИСТЦА]'}
Телефон: ${'[ТЕЛЕФОН_ИСТЦА]'}
${'[EMAIL_ИСТЦА]'}

Ответчик: ${'[ОТВЕТЧИК]'}
Адрес: ${'[АДРЕС_ОТВЕТЧИКА]'}
${'[ТЕЛЕФОН_ОТВЕТЧИКА]'}

Цена иска: ${'[СУММА_СПОРА]'} рублей
Госпошлина: ${'[ГОСПОШЛИНА]'} рублей

ИСКОВОЕ ЗАЯВЛЕНИЕ
о ${'[ТИП_СПОРА]'}

${'[ОПИСАНИЕ_СПОРА]'}

ПРАВОВЫЕ ОСНОВАНИЯ:

${'[ПРАВОВЫЕ_ОСНОВАНИЯ]'}

НА ОСНОВАНИИ ИЗЛОЖЕННОГО, руководствуясь ${'[СТАТЬИ_ЗАКОНОВ]'}, прошу суд:

${'[ТРЕБОВАНИЯ]'}

ПРИЛОЖЕНИЯ:
1. Копия искового заявления для ответчика;
2. Документы, подтверждающие обстоятельства, на которых истец основывает свои требования;
3. ${'[ДОКАЗАТЕЛЬСТВА]'}
4. Документ, подтверждающий уплату государственной пошлины;
5. Доверенность или иной документ, удостоверяющий полномочия представителя истца.

${'[ДАТА]'} г.                    ${'[ПОДПИСЬ]'}

${'[ИСТЕЦ]'}
`;

export function generateIsk(data: IskData): string {
  const legalBasis = data.legalBasis.map(basis => `• ${basis}`).join('\n');
  const claims = data.claims.map((claim, index) => `${index + 1}. ${claim};`).join('\n');
  const evidence = data.evidence.map(ev => `• ${ev}`).join('\n');
  
  // Расчет госпошлины (упрощенный)
  const gosposhlina = calculateGosposhlina(data.disputeAmount);
  
  const articles = getLegalArticles(data.disputeType);

  return ISK_TEMPLATE
    .replace(/\[СУД\]/g, data.courtName)
    .replace(/\[ИСТЕЦ\]/g, data.plaintiffName)
    .replace(/\[АДРЕС_ИСТЦА\]/g, data.plaintiffAddress)
    .replace(/\[ТЕЛЕФОН_ИСТЦА\]/g, data.plaintiffPhone)
    .replace(/\[EMAIL_ИСТЦА\]/g, data.plaintiffEmail ? `Email: ${data.plaintiffEmail}` : '')
    .replace(/\[ОТВЕТЧИК\]/g, data.defendantName)
    .replace(/\[АДРЕС_ОТВЕТЧИКА\]/g, data.defendantAddress)
    .replace(/\[ТЕЛЕФОН_ОТВЕТЧИКА\]/g, data.defendantPhone ? `Телефон: ${data.defendantPhone}` : '')
    .replace(/\[СУММА_СПОРА\]/g, data.disputeAmount.toString())
    .replace(/\[ГОСПОШЛИНА\]/g, gosposhlina.toString())
    .replace(/\[ТИП_СПОРА\]/g, getDisputeTypeText(data.disputeType))
    .replace(/\[ОПИСАНИЕ_СПОРА\]/g, data.disputeDescription)
    .replace(/\[ПРАВОВЫЕ_ОСНОВАНИЯ\]/g, legalBasis)
    .replace(/\[СТАТЬИ_ЗАКОНОВ\]/g, articles)
    .replace(/\[ТРЕБОВАНИЯ\]/g, claims)
    .replace(/\[ДОКАЗАТЕЛЬСТВА\]/g, evidence)
    .replace(/\[ДАТА\]/g, data.date)
    .replace(/\[ПОДПИСЬ\]/g, '_________________')
    .replace(/\n\n\n+/g, '\n\n');
}

function calculateGosposhlina(amount: number): number {
  if (amount <= 100000) {
    return Math.max(amount * 0.04, 400);
  } else if (amount <= 200000) {
    return 4000 + (amount - 100000) * 0.03;
  } else if (amount <= 1000000) {
    return 7000 + (amount - 200000) * 0.02;
  } else if (amount <= 2000000) {
    return 23000 + (amount - 1000000) * 0.01;
  } else {
    return 33000 + (amount - 2000000) * 0.005;
  }
}

function getDisputeTypeText(type: string): string {
  const types = {
    'потребительский': 'защите прав потребителей',
    'трудовой': 'трудовом споре',
    'жилищный': 'жилищном споре',
    'семейный': 'семейном споре',
    'гражданский': 'гражданском споре'
  };
  return types[type as keyof typeof types] || 'гражданском споре';
}

function getLegalArticles(type: string): string {
  const articles = {
    'потребительский': 'статьями 15, 17, 18, 22, 23 Закона РФ "О защите прав потребителей", статьями 12, 15, 1064 ГК РФ',
    'трудовой': 'статьями 21, 22, 80, 81, 84.1 ТК РФ, статьями 12, 15 ГК РФ',
    'жилищный': 'статьями 15, 16, 17, 30, 35 ЖК РФ, статьями 12, 15 ГК РФ',
    'семейный': 'статьями 1, 2, 21, 22, 25 СК РФ, статьями 12, 15 ГК РФ',
    'гражданский': 'статьями 1, 2, 8, 9, 10 ГК РФ'
  };
  return articles[type as keyof typeof articles] || 'статьями 12, 15 ГК РФ';
}
