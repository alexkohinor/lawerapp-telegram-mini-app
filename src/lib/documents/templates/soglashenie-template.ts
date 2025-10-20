/**
 * Шаблон соглашения
 */

export interface SoglashenieData {
  // Тип соглашения
  agreementType: 'мировое' | 'о_разделе_имущества' | 'об_алиментах' | 'о_расторжении_договора' | 'о_возмещении_ущерба';
  
  // Стороны соглашения
  party1Name: string;
  party1Address: string;
  party1Phone: string;
  party1Email?: string;
  
  party2Name: string;
  party2Address: string;
  party2Phone: string;
  party2Email?: string;
  
  // Предмет соглашения
  subject: string;
  description: string;
  
  // Условия
  terms: string[];
  amount?: number;
  currency: 'RUB' | 'USD' | 'EUR';
  paymentSchedule?: string;
  
  // Сроки
  agreementStartDate: string;
  agreementEndDate?: string;
  signingDate: string;
  
  // Дополнительные условия
  additionalTerms?: string;
  penalties?: string;
  terminationConditions?: string;
}

export const SOGLASENIE_TEMPLATE = `
СОГЛАШЕНИЕ ${'[ТИП_СОГЛАШЕНИЯ]'}

г. ${'[ГОРОД]'}                                    ${'[ДАТА_ПОДПИСАНИЯ]'} г.

${'[СТОРОНА_1]'}, именуемый(ая) в дальнейшем "${'[СТОРОНА_1_НАЗВАНИЕ]'}", с одной стороны, и ${'[СТОРОНА_2]'}, именуемый(ая) в дальнейшем "${'[СТОРОНА_2_НАЗВАНИЕ]'}", с другой стороны, заключили настоящее соглашение о нижеследующем:

1. ПРЕДМЕТ СОГЛАШЕНИЯ

${'[ПРЕДМЕТ_СОГЛАШЕНИЯ]'}

${'[ОПИСАНИЕ]'}

2. УСЛОВИЯ СОГЛАШЕНИЯ

${'[УСЛОВИЯ]'}

${'[СУММА_И_ПЛАТЕЖИ]'}

3. СРОКИ ДЕЙСТВИЯ

3.1. Соглашение вступает в силу с ${'[ДАТА_НАЧАЛА]'}.

${'[ДАТА_ОКОНЧАНИЯ]'}

4. ОТВЕТСТВЕННОСТЬ СТОРОН

4.1. Стороны несут ответственность за неисполнение или ненадлежащее исполнение обязательств по настоящему соглашению в соответствии с действующим законодательством РФ.

${'[ШТРАФНЫЕ_САНКЦИИ]'}

5. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ

5.1. Все споры и разногласия решаются путем переговоров, а при недостижении согласия - в судебном порядке.

5.2. Настоящее соглашение составлено в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой стороны.

${'[ДОПОЛНИТЕЛЬНЫЕ_УСЛОВИЯ]'}

${'[УСЛОВИЯ_РАСТОРЖЕНИЯ]'}

ПОДПИСИ СТОРОН:

${'[СТОРОНА_1_НАЗВАНИЕ]'}:                    ${'[СТОРОНА_2_НАЗВАНИЕ]'}:

_________________                              _________________
(${'[ПОДПИСЬ_1]'})                              (${'[ПОДПИСЬ_2]'})

М.П.                                          М.П.
`;

export function generateSoglashenie(data: SoglashenieData): string {
  const agreementTypeText = getAgreementTypeText(data.agreementType);
  const subjectText = getSubjectText(data.agreementType, data.subject);
  const termsText = data.terms.map((term, index) => `${index + 1}. ${term};`).join('\n');
  
  let amountText = '';
  if (data.amount) {
    const formattedAmount = data.amount.toLocaleString('ru-RU');
    amountText = `2.1. Сумма соглашения составляет ${formattedAmount} ${getCurrencyText(data.currency)}.\n`;
    if (data.paymentSchedule) {
      amountText += `2.2. ${data.paymentSchedule}\n`;
    }
  }

  return SOGLASENIE_TEMPLATE
    .replace(/\[ТИП_СОГЛАШЕНИЯ\]/g, agreementTypeText)
    .replace(/\[ГОРОД\]/g, 'Москва')
    .replace(/\[ДАТА_ПОДПИСАНИЯ\]/g, data.signingDate)
    .replace(/\[СТОРОНА_1\]/g, data.party1Name)
    .replace(/\[СТОРОНА_1_НАЗВАНИЕ\]/g, 'Сторона 1')
    .replace(/\[СТОРОНА_2\]/g, data.party2Name)
    .replace(/\[СТОРОНА_2_НАЗВАНИЕ\]/g, 'Сторона 2')
    .replace(/\[ПРЕДМЕТ_СОГЛАШЕНИЯ\]/g, subjectText)
    .replace(/\[ОПИСАНИЕ\]/g, data.description)
    .replace(/\[УСЛОВИЯ\]/g, termsText)
    .replace(/\[СУММА_И_ПЛАТЕЖИ\]/g, amountText)
    .replace(/\[ДАТА_НАЧАЛА\]/g, data.agreementStartDate)
    .replace(/\[ДАТА_ОКОНЧАНИЯ\]/g, data.agreementEndDate ? `3.2. Соглашение действует до ${data.agreementEndDate}.` : '')
    .replace(/\[ШТРАФНЫЕ_САНКЦИИ\]/g, data.penalties ? `4.2. ${data.penalties}` : '')
    .replace(/\[ДОПОЛНИТЕЛЬНЫЕ_УСЛОВИЯ\]/g, data.additionalTerms ? `5.3. ${data.additionalTerms}` : '')
    .replace(/\[УСЛОВИЯ_РАСТОРЖЕНИЯ\]/g, data.terminationConditions ? `5.4. ${data.terminationConditions}` : '')
    .replace(/\[ПОДПИСЬ_1\]/g, data.party1Name)
    .replace(/\[ПОДПИСЬ_2\]/g, data.party2Name)
    .replace(/\n\n\n+/g, '\n\n');
}

function getAgreementTypeText(type: string): string {
  const types = {
    'мировое': 'МИРОВОЕ',
    'о_разделе_имущества': 'О РАЗДЕЛЕ ИМУЩЕСТВА',
    'об_алиментах': 'ОБ АЛИМЕНТАХ',
    'о_расторжении_договора': 'О РАСТОРЖЕНИИ ДОГОВОРА',
    'о_возмещении_ущерба': 'О ВОЗМЕЩЕНИИ УЩЕРБА'
  };
  return types[type as keyof typeof types] || 'МИРОВОЕ';
}

function getSubjectText(type: string, subject: string): string {
  const subjects = {
    'мировое': `1.1. Стороны пришли к соглашению об урегулировании спора по вопросу: ${subject}.`,
    'о_разделе_имущества': `1.1. Стороны пришли к соглашению о разделе совместно нажитого имущества: ${subject}.`,
    'об_алиментах': `1.1. Стороны пришли к соглашению об уплате алиментов на содержание: ${subject}.`,
    'о_расторжении_договора': `1.1. Стороны пришли к соглашению о расторжении договора: ${subject}.`,
    'о_возмещении_ущерба': `1.1. Стороны пришли к соглашению о возмещении ущерба: ${subject}.`
  };
  return subjects[type as keyof typeof subjects] || `1.1. Предметом соглашения является: ${subject}.`;
}

function getCurrencyText(currency: string): string {
  const currencies = {
    'RUB': 'рублей',
    'USD': 'долларов США',
    'EUR': 'евро'
  };
  return currencies[currency as keyof typeof currencies] || 'рублей';
}
