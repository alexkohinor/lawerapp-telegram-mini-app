/**
 * Шаблон претензии по защите прав потребителей
 */

export interface PretenziyaData {
  // Данные потребителя
  consumerName: string;
  consumerAddress: string;
  consumerPhone: string;
  consumerEmail?: string;
  
  // Данные продавца/исполнителя
  sellerName: string;
  sellerAddress: string;
  sellerPhone?: string;
  
  // Данные о товаре/услуге
  productName: string;
  productDescription: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyPeriod?: string;
  
  // Проблема
  problemDescription: string;
  defectType: 'качество' | 'комплектность' | 'безопасность' | 'другое';
  defectDescription: string;
  
  // Требования
  requirements: ('возврат' | 'замена' | 'устранение' | 'снижение_цены' | 'возмещение_ущерба')[];
  additionalRequirements?: string;
  
  // Сроки
  responseDeadline: string; // количество дней
  date: string;
}

export const PRETENZIYA_TEMPLATE = `
ПРЕТЕНЗИЯ

${'[ПОТРЕБИТЕЛЬ]'}
${'[АДРЕС_ПОТРЕБИТЕЛЯ]'}
${'[ТЕЛЕФОН_ПОТРЕБИТЕЛЯ]'}
${'[EMAIL_ПОТРЕБИТЕЛЯ]'}

${'[ПРОДАВЕЦ]'}
${'[АДРЕС_ПРОДАВЦА]'}
${'[ТЕЛЕФОН_ПРОДАВЦА]'}

ПРЕТЕНЗИЯ

Я, ${'[ПОТРЕБИТЕЛЬ]'}, ${'[ДАТА]'} года приобрел(а) у Вас товар: ${'[НАЗВАНИЕ_ТОВАРА]'}.

Описание товара: ${'[ОПИСАНИЕ_ТОВАРА]'}
Дата покупки: ${'[ДАТА_ПОКУПКИ]'}
Цена: ${'[ЦЕНА]'} рублей
${'[ГАРАНТИЙНЫЙ_ПЕРИОД]'}

В процессе использования товара мной был обнаружен следующий недостаток: ${'[ОПИСАНИЕ_НЕДОСТАТКА]'}.

Тип недостатка: ${'[ТИП_НЕДОСТАТКА]'}

Согласно статье 18 Закона РФ "О защите прав потребителей", при обнаружении недостатков товара потребитель вправе:

${'[ТРЕБОВАНИЯ]'}

На основании изложенного, в соответствии со статьями 18, 22, 23 Закона РФ "О защите прав потребителей", требую:

${'[ДОПОЛНИТЕЛЬНЫЕ_ТРЕБОВАНИЯ]'}

В случае неудовлетворения моих требований в добровольном порядке в течение ${'[СРОК_ОТВЕТА]'} дней, я буду вынужден обратиться в суд с исковым заявлением о защите прав потребителей, где буду требовать:

1. Удовлетворения заявленных требований;
2. Возмещения морального вреда;
3. Взыскания неустойки в размере 1% от стоимости товара за каждый день просрочки;
4. Возмещения судебных расходов.

Приложение:
- Копия товарного чека (кассового чека);
- Копия гарантийного талона;
- Фотографии недостатков товара.

${'[ДАТА]'} г.                    ${'[ПОДПИСЬ]'}

${'[ПОТРЕБИТЕЛЬ]'}
`;

export function generatePretenziya(data: PretenziyaData): string {
  const requirements = data.requirements.map(req => {
    switch (req) {
      case 'возврат': return '• потребовать замены на товар этой же марки (этих же модели и (или) артикула);';
      case 'замена': return '• потребовать замены на такой же товар другой марки (модели, артикула) с соответствующим перерасчетом покупной цены;';
      case 'устранение': return '• потребовать незамедлительного безвозмездного устранения недостатков товара или возмещения расходов на их исправление потребителем или третьим лицом;';
      case 'снижение_цены': return '• потребовать соразмерного уменьшения покупной цены;';
      case 'возмещение_ущерба': return '• потребовать возмещения убытков, причиненных потребителю вследствие продажи товара ненадлежащего качества;';
      default: return '';
    }
  }).join('\n');

  const additionalRequirements = data.additionalRequirements || '';

  return PRETENZIYA_TEMPLATE
    .replace(/\[ПОТРЕБИТЕЛЬ\]/g, data.consumerName)
    .replace(/\[АДРЕС_ПОТРЕБИТЕЛЯ\]/g, data.consumerAddress)
    .replace(/\[ТЕЛЕФОН_ПОТРЕБИТЕЛЯ\]/g, data.consumerPhone)
    .replace(/\[EMAIL_ПОТРЕБИТЕЛЯ\]/g, data.consumerEmail || '')
    .replace(/\[ПРОДАВЕЦ\]/g, data.sellerName)
    .replace(/\[АДРЕС_ПРОДАВЦА\]/g, data.sellerAddress)
    .replace(/\[ТЕЛЕФОН_ПРОДАВЦА\]/g, data.sellerPhone || '')
    .replace(/\[НАЗВАНИЕ_ТОВАРА\]/g, data.productName)
    .replace(/\[ОПИСАНИЕ_ТОВАРА\]/g, data.productDescription)
    .replace(/\[ДАТА_ПОКУПКИ\]/g, data.purchaseDate)
    .replace(/\[ЦЕНА\]/g, data.purchasePrice.toString())
    .replace(/\[ГАРАНТИЙНЫЙ_ПЕРИОД\]/g, data.warrantyPeriod ? `Гарантийный период: ${data.warrantyPeriod}` : '')
    .replace(/\[ОПИСАНИЕ_НЕДОСТАТКА\]/g, data.defectDescription)
    .replace(/\[ТИП_НЕДОСТАТКА\]/g, data.defectType)
    .replace(/\[ТРЕБОВАНИЯ\]/g, requirements)
    .replace(/\[ДОПОЛНИТЕЛЬНЫЕ_ТРЕБОВАНИЯ\]/g, additionalRequirements)
    .replace(/\[СРОК_ОТВЕТА\]/g, data.responseDeadline)
    .replace(/\[ДАТА\]/g, data.date)
    .replace(/\[ПОДПИСЬ\]/g, '_________________')
    .replace(/\n\n\n+/g, '\n\n'); // Убираем лишние переносы строк
}
