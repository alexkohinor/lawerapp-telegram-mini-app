/**
 * Шаблон договора
 */

export interface DogovorData {
  // Тип договора
  contractType: 'купли_продажи' | 'оказания_услуг' | 'аренды' | 'подряда' | 'займа';
  
  // Стороны договора
  party1Name: string;
  party1Address: string;
  party1Phone: string;
  party1Email?: string;
  party1Passport?: string;
  
  party2Name: string;
  party2Address: string;
  party2Phone: string;
  party2Email?: string;
  party2Passport?: string;
  
  // Предмет договора
  subject: string;
  description: string;
  
  // Условия
  price: number;
  currency: 'RUB' | 'USD' | 'EUR';
  paymentTerms: string;
  deliveryTerms?: string;
  warrantyPeriod?: string;
  
  // Сроки
  contractStartDate: string;
  contractEndDate?: string;
  signingDate: string;
  
  // Дополнительные условия
  additionalTerms?: string;
  penalties?: string;
  terminationConditions?: string;
}

export const DOGOVOR_TEMPLATE = `
ДОГОВОР ${'[ТИП_ДОГОВОРА]'}

г. ${'[ГОРОД]'}                                    ${'[ДАТА_ПОДПИСАНИЯ]'} г.

${'[СТОРОНА_1]'}, именуемый(ая) в дальнейшем "${'[СТОРОНА_1_НАЗВАНИЕ]'}", с одной стороны, и ${'[СТОРОНА_2]'}, именуемый(ая) в дальнейшем "${'[СТОРОНА_2_НАЗВАНИЕ]'}", с другой стороны, заключили настоящий договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА

${'[ПРЕДМЕТ_ДОГОВОРА]'}

${'[ОПИСАНИЕ]'}

2. ЦЕНА И ПОРЯДОК РАСЧЕТОВ

2.1. Стоимость ${'[ПРЕДМЕТ]'} составляет ${'[ЦЕНА]'} ${'[ВАЛЮТА]'}.

2.2. ${'[УСЛОВИЯ_ОПЛАТЫ]'}

${'[УСЛОВИЯ_ПОСТАВКИ]'}

3. СРОКИ ВЫПОЛНЕНИЯ

3.1. Договор вступает в силу с ${'[ДАТА_НАЧАЛА]'}.

${'[ДАТА_ОКОНЧАНИЯ]'}

4. ОТВЕТСТВЕННОСТЬ СТОРОН

4.1. За неисполнение или ненадлежащее исполнение обязательств по настоящему договору стороны несут ответственность в соответствии с действующим законодательством РФ.

${'[ШТРАФНЫЕ_САНКЦИИ]'}

5. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ

5.1. Все споры и разногласия решаются путем переговоров, а при недостижении согласия - в судебном порядке.

5.2. Настоящий договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой стороны.

${'[ДОПОЛНИТЕЛЬНЫЕ_УСЛОВИЯ]'}

${'[УСЛОВИЯ_РАСТОРЖЕНИЯ]'}

ПОДПИСИ СТОРОН:

${'[СТОРОНА_1_НАЗВАНИЕ]'}:                    ${'[СТОРОНА_2_НАЗВАНИЕ]'}:

_________________                              _________________
(${'[ПОДПИСЬ_1]'})                              (${'[ПОДПИСЬ_2]'})

М.П.                                          М.П.
`;

export function generateDogovor(data: DogovorData): string {
  const contractTypeText = getContractTypeText(data.contractType);
  const subjectText = getSubjectText(data.contractType, data.subject);
  const priceText = formatPrice(data.price, data.currency);
  
  return DOGOVOR_TEMPLATE
    .replace(/\[ТИП_ДОГОВОРА\]/g, contractTypeText)
    .replace(/\[ГОРОД\]/g, 'Москва') // Можно сделать настраиваемым
    .replace(/\[ДАТА_ПОДПИСАНИЯ\]/g, data.signingDate)
    .replace(/\[СТОРОНА_1\]/g, data.party1Name)
    .replace(/\[СТОРОНА_1_НАЗВАНИЕ\]/g, 'Сторона 1')
    .replace(/\[СТОРОНА_2\]/g, data.party2Name)
    .replace(/\[СТОРОНА_2_НАЗВАНИЕ\]/g, 'Сторона 2')
    .replace(/\[ПРЕДМЕТ_ДОГОВОРА\]/g, subjectText)
    .replace(/\[ОПИСАНИЕ\]/g, data.description)
    .replace(/\[ПРЕДМЕТ\]/g, data.subject.toLowerCase())
    .replace(/\[ЦЕНА\]/g, priceText)
    .replace(/\[ВАЛЮТА\]/g, getCurrencyText(data.currency))
    .replace(/\[УСЛОВИЯ_ОПЛАТЫ\]/g, data.paymentTerms)
    .replace(/\[УСЛОВИЯ_ПОСТАВКИ\]/g, data.deliveryTerms ? `2.3. ${data.deliveryTerms}` : '')
    .replace(/\[ДАТА_НАЧАЛА\]/g, data.contractStartDate)
    .replace(/\[ДАТА_ОКОНЧАНИЯ\]/g, data.contractEndDate ? `3.2. Договор действует до ${data.contractEndDate}.` : '')
    .replace(/\[ШТРАФНЫЕ_САНКЦИИ\]/g, data.penalties ? `4.2. ${data.penalties}` : '')
    .replace(/\[ДОПОЛНИТЕЛЬНЫЕ_УСЛОВИЯ\]/g, data.additionalTerms ? `5.3. ${data.additionalTerms}` : '')
    .replace(/\[УСЛОВИЯ_РАСТОРЖЕНИЯ\]/g, data.terminationConditions ? `5.4. ${data.terminationConditions}` : '')
    .replace(/\[ПОДПИСЬ_1\]/g, data.party1Name)
    .replace(/\[ПОДПИСЬ_2\]/g, data.party2Name)
    .replace(/\n\n\n+/g, '\n\n');
}

function getContractTypeText(type: string): string {
  const types = {
    'купли_продажи': 'КУПЛИ-ПРОДАЖИ',
    'оказания_услуг': 'ОКАЗАНИЯ УСЛУГ',
    'аренды': 'АРЕНДЫ',
    'подряда': 'ПОДРЯДА',
    'займа': 'ЗАЙМА'
  };
  return types[type as keyof typeof types] || 'ОКАЗАНИЯ УСЛУГ';
}

function getSubjectText(type: string, subject: string): string {
  const subjects = {
    'купли_продажи': `1.1. Продавец обязуется передать в собственность Покупателя товар: ${subject}, а Покупатель обязуется принять товар и уплатить за него определенную договором цену.`,
    'оказания_услуг': `1.1. Исполнитель обязуется оказать услуги: ${subject}, а Заказчик обязуется принять и оплатить оказанные услуги.`,
    'аренды': `1.1. Арендодатель обязуется предоставить Арендатору во временное владение и пользование: ${subject}, а Арендатор обязуется своевременно вносить арендную плату.`,
    'подряда': `1.1. Подрядчик обязуется выполнить работы: ${subject}, а Заказчик обязуется принять и оплатить выполненные работы.`,
    'займа': `1.1. Займодавец передает в собственность Заемщику денежные средства в размере ${subject}, а Заемщик обязуется возвратить полученную сумму и уплатить проценты.`
  };
  return subjects[type as keyof typeof subjects] || `1.1. Предметом договора является: ${subject}.`;
}

function formatPrice(price: number, currency: string): string {
  const formattedPrice = price.toLocaleString('ru-RU');
  return `${formattedPrice} ${getCurrencyText(currency)}`;
}

function getCurrencyText(currency: string): string {
  const currencies = {
    'RUB': 'рублей',
    'USD': 'долларов США',
    'EUR': 'евро'
  };
  return currencies[currency as keyof typeof currencies] || 'рублей';
}
