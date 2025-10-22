# 🚀 План реализации MVP - Защита от налоговых взысканий

**Дата:** 2024-10-22  
**Версия:** 1.0  
**Срок реализации:** 2-3 месяца  
**Команда:** 1 Full-stack разработчик + AI Assistant

## 🎯 Цели MVP

### Главная цель
**Предоставить пользователям возможность автоматически генерировать 3 ключевых документа для оспаривания налоговых требований.**

### Ключевые функции MVP
1. ✅ **Генерация возражений** на акт налоговой проверки
2. ✅ **Генерация жалобы** в вышестоящий налоговый орган
3. ✅ **Генерация уведомления** о несогласии
4. ✅ **AI-анализ** налоговых требований (базовый)
5. ✅ **Калькулятор** транспортного налога
6. ✅ **База знаний** с основными статьями НК РФ

### Метрики успеха MVP
- 👥 **100+ пользователей** за первый месяц
- 📄 **50+ сгенерированных документов**
- ⭐ **4.0+ средняя оценка** в отзывах
- 🎯 **30%+ успешных оспариваний** (обратная связь)
- 💰 **10+ платных подписок** (после запуска монетизации)

## 📋 Структура MVP

### 1. Интерфейс миниаппа

#### 1.1. Главный экран
```
┌─────────────────────────────────────┐
│  ⚖️ Защита от налоговых взысканий   │
├─────────────────────────────────────┤
│                                     │
│  📋 Мои споры (0)                   │
│  ⏰ Ближайший дедлайн: -            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🤖 Новый спор                 │ │
│  │ Начать оспаривание            │ │
│  └───────────────────────────────┘ │
│                                     │
│  📚 Полезные материалы:             │
│  • Как оспорить транспортный налог  │
│  • Что делать при получении требов.│
│  • Сроки обжалования               │
│                                     │
│  💡 Калькуляторы:                   │
│  • Транспортный налог              │
│  • Пени и штрафы                   │
│                                     │
└─────────────────────────────────────┘
```

#### 1.2. Создание нового спора (Step Wizard)
```
Шаг 1: Тип налога
┌─────────────────────────────────────┐
│  Какой налог вам начислили?         │
├─────────────────────────────────────┤
│  ○ Транспортный налог               │
│  ○ Налог на имущество               │
│  ○ Земельный налог                  │
│  ○ НДФЛ                             │
│  ○ НПД (для самозанятых)            │
│  ○ Другое                           │
│                                     │
│  [Далее]                            │
└─────────────────────────────────────┘

Шаг 2: Сумма и период
┌─────────────────────────────────────┐
│  Детали требования                  │
├─────────────────────────────────────┤
│  Сумма налога:     [_______] руб.   │
│  Сумма пеней:      [_______] руб.   │
│  Сумма штрафа:     [_______] руб.   │
│                                     │
│  Налоговый период: [2023 ▼]         │
│  Дата требования:  [22.10.2024 📅]  │
│                                     │
│  [Назад]  [Далее]                   │
└─────────────────────────────────────┘

Шаг 3: Основания для оспаривания
┌─────────────────────────────────────┐
│  Почему вы не согласны?             │
├─────────────────────────────────────┤
│  ☑ Я уже заплатил этот налог        │
│  ☑ Расчет неверный                  │
│  ☐ Я не владел имуществом           │
│  ☐ Срок давности истек              │
│  ☐ Я имею право на льготу           │
│  ☐ Другое: [________________]       │
│                                     │
│  [Назад]  [Далее]                   │
└─────────────────────────────────────┘

Шаг 4: Документы
┌─────────────────────────────────────┐
│  Приложите подтверждающие документы │
├─────────────────────────────────────┤
│  📎 Квитанция об оплате.pdf         │
│     (загружено 22.10.2024)          │
│                                     │
│  📎 Справка из ГИБДД.pdf            │
│     (загружено 22.10.2024)          │
│                                     │
│  [+ Добавить файл]                  │
│  [📷 Сфотографировать]              │
│                                     │
│  [Назад]  [Далее]                   │
└─────────────────────────────────────┘

Шаг 5: Личные данные
┌─────────────────────────────────────┐
│  Ваши данные для документа          │
├─────────────────────────────────────┤
│  ФИО:    [____________________]     │
│  ИНН:    [____________________]     │
│  Адрес:  [____________________]     │
│  Телефон:[____________________]     │
│                                     │
│  ИФНС:   [№ 12 по г. Москва ▼]      │
│                                     │
│  [Назад]  [Создать документ]        │
└─────────────────────────────────────┘

Шаг 6: AI-анализ и рекомендации
┌─────────────────────────────────────┐
│  🤖 Анализ вашей ситуации           │
├─────────────────────────────────────┤
│  ✅ Шансы на успех: ВЫСОКИЕ (85%)   │
│                                     │
│  📊 Анализ:                         │
│  • Представлены платежные документы │
│  • Расчет налоговой не соответствует│
│    ставке для вашего региона        │
│  • Срок давности не истек           │
│                                     │
│  💡 Рекомендация:                   │
│  Подать возражение на акт проверки  │
│  с требованием перерасчета          │
│                                     │
│  📋 Правовая база:                  │
│  • Ст. 100 НК РФ (порядок обжал.)   │
│  • Ст. 356 НК РФ (ставки налога)    │
│  • Постановление ВС РФ № 57         │
│                                     │
│  [Назад]  [Выбрать документ]        │
└─────────────────────────────────────┘

Шаг 7: Выбор документа
┌─────────────────────────────────────┐
│  Какой документ нужен?              │
├─────────────────────────────────────┤
│  ○ Возражения на акт проверки       │
│     Если проводилась проверка       │
│                                     │
│  ● Заявление о перерасчете          │
│     Если ошибка в расчете           │
│                                     │
│  ○ Жалоба в вышестоящий орган       │
│     Если ИФНС отказала              │
│                                     │
│  [Назад]  [Сгенерировать]           │
└─────────────────────────────────────┘

Шаг 8: Предпросмотр документа
┌─────────────────────────────────────┐
│  📄 Заявление о перерасчете налога  │
├─────────────────────────────────────┤
│  [Просмотр документа]               │
│                                     │
│  В ИФНС № 12 по г. Москве           │
│  от Иванова Ивана Ивановича         │
│  ИНН 7712345678...                  │
│                                     │
│  ✏️ [Редактировать]                 │
│  📥 [Скачать PDF]                   │
│  📥 [Скачать DOCX]                  │
│  ✉️ [Отправить на email]            │
│                                     │
│  📋 Следующие шаги:                 │
│  1. Распечатайте документ           │
│  2. Подпишите в 2 экземплярах       │
│  3. Отправьте в ИФНС (срок: 7 дней) │
│  4. Сохраните копию с отметкой      │
│                                     │
│  [Готово]                           │
└─────────────────────────────────────┘
```

### 2. Шаблоны документов

#### 2.1. Заявление о перерасчете налога
```typescript
interface ObjectionTemplate {
  // Заголовок
  inspectionName: string;
  inspectionNumber: string;
  inspectionCity: string;
  
  // Заявитель
  taxpayerName: string;
  taxpayerINN: string;
  taxpayerAddress: string;
  taxpayerPhone: string;
  
  // Данные о налоге
  taxType: string;
  taxPeriod: string;
  taxAmount: number;
  
  // Основания для перерасчета
  grounds: string[];
  legalBasis: string[];
  
  // Расчет
  correctAmount: number;
  overpaidAmount: number;
  
  // Приложения
  attachments: string[];
}

const objectionTemplate = `
В Инспекцию Федеральной налоговой службы
№ {{inspectionNumber}} по {{inspectionCity}}
от {{taxpayerName}}
ИНН {{taxpayerINN}}
адрес: {{taxpayerAddress}}
телефон: {{taxpayerPhone}}

ЗАЯВЛЕНИЕ
о перерасчете налога

На основании ст. 52, 78, 81 Налогового кодекса РФ прошу произвести перерасчет {{taxType}} за {{taxPeriod}} в связи с неправильным исчислением налога.

ОБСТОЯТЕЛЬСТВА ДЕЛА:

{{#each grounds}}
{{@index}}. {{this}}
{{/each}}

ПРАВОВОЕ ОБОСНОВАНИЕ:

{{#each legalBasis}}
{{this}}
{{/each}}

РАСЧЕТ ПРАВИЛЬНОЙ СУММЫ НАЛОГА:

┌─────────────────────────────────────────────────┐
│ Начислено налоговой:          {{taxAmount}} руб.│
│ Правильная сумма налога:  {{correctAmount}} руб.│
│ Переплата:               {{overpaidAmount}} руб.│
└─────────────────────────────────────────────────┘

ТРЕБОВАНИЯ:

Прошу:
1. Произвести перерасчет {{taxType}} за {{taxPeriod}}.
2. Вернуть переплату в размере {{overpaidAmount}} рублей на расчетный счет:
   [Банковские реквизиты для возврата]

Приложения:
{{#each attachments}}
{{@index}}. {{this}}
{{/each}}

Дата: {{currentDate}}
Подпись: _______________ ({{taxpayerName}})
`;
```

#### 2.2. Жалоба в вышестоящий налоговый орган
```typescript
const complaintTemplate = `
В Управление Федеральной налоговой службы
по {{region}}
от {{taxpayerName}}
ИНН {{taxpayerINN}}

ЖАЛОБА
на решение ИФНС № {{inspectionNumber}}

На основании ст. 137, 138 НК РФ обжалую решение ИФНС № {{decisionNumber}} от {{decisionDate}} о доначислении {{taxType}} в сумме {{taxAmount}} рублей.

ОСНОВАНИЯ ДЛЯ ОТМЕНЫ РЕШЕНИЯ:

1. НАРУШЕНИЕ МАТЕРИАЛЬНОГО ПРАВА:

{{#each materialViolations}}
{{@index}}. {{this}}
{{/each}}

2. НАРУШЕНИЕ ПРОЦЕССУАЛЬНОГО ПРАВА:

{{#each proceduralViolations}}
{{@index}}. {{this}}
{{/each}}

3. СУДЕБНАЯ ПРАКТИКА:

{{#each precedents}}
{{this}}
{{/each}}

ТРЕБОВАНИЯ:

Прошу отменить решение ИФНС № {{inspectionNumber}} и прекратить взыскание задолженности.

Приложения:
{{#each attachments}}
{{@index}}. {{this}}
{{/each}}

Дата: {{currentDate}}
Подпись: _______________ ({{taxpayerName}})
`;
```

#### 2.3. Уведомление о несогласии
```typescript
const noticeTemplate = `
В ИФНС № {{inspectionNumber}} по {{inspectionCity}}

УВЕДОМЛЕНИЕ
о несогласии с решением по жалобе

Довожу до Вашего сведения, что я не согласен с решением по жалобе 
№ {{complaintNumber}} от {{complaintDate}}.

Считаю доначисление {{taxType}} в сумме {{taxAmount}} рублей незаконным 
по следующим основаниям:

{{#each reasons}}
{{@index}}. {{this}}
{{/each}}

Настаиваю на своей позиции, изложенной в жалобе.

Оставляю за собой право на обращение в суд для защиты своих законных прав и интересов.

Дата: {{currentDate}}
Подпись: _______________ ({{taxpayerName}})
`;
```

### 3. AI-движок для анализа

#### 3.1. Анализатор налоговых требований
```typescript
class TaxRequirementAnalyzer {
  /**
   * Анализ налогового требования
   */
  async analyzeTaxRequirement(data: {
    taxType: string;
    amount: number;
    period: string;
    grounds: string[];
    userDocuments: File[];
  }): Promise<AnalysisResult> {
    // 1. Проверка корректности расчета
    const calculationCheck = await this.checkCalculation(data);
    
    // 2. Проверка срока давности
    const limitationCheck = await this.checkLimitation(data.period);
    
    // 3. Поиск аналогичных случаев в базе знаний
    const similarCases = await this.findSimilarCases(data);
    
    // 4. Анализ пользовательских документов
    const documentAnalysis = await this.analyzeDocuments(data.userDocuments);
    
    // 5. Определение правовой базы
    const legalBasis = await this.findLegalBasis(data.taxType, data.grounds);
    
    // 6. Расчет шансов на успех
    const successRate = this.calculateSuccessRate({
      calculationCheck,
      limitationCheck,
      similarCases,
      documentAnalysis,
    });
    
    // 7. Генерация рекомендаций
    const recommendations = this.generateRecommendations({
      successRate,
      calculationCheck,
      limitationCheck,
      legalBasis,
    });
    
    return {
      isValid: calculationCheck.isCorrect,
      errors: calculationCheck.errors,
      successRate,
      recommendations,
      legalBasis,
      similarCases,
      estimatedTime: this.estimateTimeToResolve(data.taxType),
    };
  }
  
  /**
   * Проверка корректности расчета налога
   */
  private async checkCalculation(data: {
    taxType: string;
    amount: number;
    period: string;
  }): Promise<CalculationCheckResult> {
    const calculator = this.getCalculatorForTaxType(data.taxType);
    
    // Получение параметров для расчета из базы знаний
    const taxParameters = await this.getTaxParameters(data.taxType, data.period);
    
    // Расчет правильной суммы
    const correctAmount = await calculator.calculate(taxParameters);
    
    const errors: TaxError[] = [];
    
    if (Math.abs(correctAmount - data.amount) > 0.01) {
      errors.push({
        type: 'calculation',
        description: `Расчет налоговой не соответствует действующим ставкам`,
        amount: data.amount - correctAmount,
        legalBasis: this.getLegalBasisForRate(data.taxType),
        evidenceRequired: ['Расчет налога', 'Справка о ставках'],
      });
    }
    
    return {
      isCorrect: errors.length === 0,
      correctAmount,
      difference: data.amount - correctAmount,
      errors,
    };
  }
  
  /**
   * Поиск аналогичных случаев
   */
  private async findSimilarCases(data: {
    taxType: string;
    grounds: string[];
  }): Promise<SimilarCase[]> {
    const knowledgeService = new LegalKnowledgeService(defaultRAGConfig);
    
    // Формирование запроса для поиска
    const query = `${data.taxType} ${data.grounds.join(' ')}`;
    
    // Поиск в базе знаний
    const results = await knowledgeService.searchLegalDocuments(query, {
      type: 'precedent',
      tags: [data.taxType, 'налоговые споры'],
    });
    
    return results.map(result => ({
      title: result.title,
      outcome: this.extractOutcome(result.content),
      similarity: result.relevance,
      legalBasis: this.extractLegalBasis(result.content),
    }));
  }
}
```

### 4. Калькуляторы налогов

#### 4.1. Калькулятор транспортного налога
```typescript
class TransportTaxCalculator {
  /**
   * Расчет транспортного налога
   */
  async calculateTransportTax(params: {
    region: string;
    vehicleType: 'car' | 'motorcycle' | 'truck';
    enginePower: number; // л.с.
    yearOfManufacture: number;
    ownershipMonths: number;
    hasPrivilege: boolean;
  }): Promise<TransportTaxResult> {
    // Получение ставки для региона
    const rate = await this.getRateForRegion(
      params.region,
      params.vehicleType,
      params.enginePower
    );
    
    // Расчет коэффициента владения
    const ownershipCoef = params.ownershipMonths / 12;
    
    // Расчет повышающего коэффициента (для дорогих авто)
    const luxuryCoef = await this.getLuxuryCoefficient(
      params.vehicleType,
      params.yearOfManufacture
    );
    
    // Расчет льготы
    const privilegeDiscount = params.hasPrivilege ? 0.5 : 0;
    
    // Итоговая сумма
    const baseTax = params.enginePower * rate * ownershipCoef * luxuryCoef;
    const taxAmount = baseTax * (1 - privilegeDiscount);
    
    return {
      baseTax,
      taxAmount,
      rate,
      ownershipCoef,
      luxuryCoef,
      privilegeDiscount,
      breakdown: {
        'Налоговая база (л.с.)': params.enginePower,
        'Ставка (руб./л.с.)': rate,
        'Коэффициент владения': ownershipCoef,
        'Повышающий коэффициент': luxuryCoef,
        'Льгота': privilegeDiscount * 100 + '%',
      },
    };
  }
  
  /**
   * Получение ставки для региона
   */
  private async getRateForRegion(
    region: string,
    vehicleType: string,
    enginePower: number
  ): Promise<number> {
    // Загрузка ставок из базы данных
    const rates = await prisma.transportTaxRate.findFirst({
      where: {
        region,
        vehicleType,
        powerMin: { lte: enginePower },
        powerMax: { gte: enginePower },
      },
    });
    
    return rates?.rate || this.getDefaultRate(vehicleType, enginePower);
  }
}
```

### 5. База данных

#### 5.1. Расширение Prisma схемы
```prisma
// Налоговые споры
model TaxDispute {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  taxType         String    @map("tax_type")
  amount          Decimal   @db.Decimal(12, 2)
  period          String
  status          String    @default("active")
  successRate     Float?    @map("success_rate")
  deadline        DateTime?
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  user            User      @relation(fields: [userId], references: [id])
  documents       TaxDisputeDocument[]
  timeline        TaxDisputeTimeline[]
  
  @@map("tax_disputes")
}

// Документы по спору
model TaxDisputeDocument {
  id              String    @id @default(uuid())
  disputeId       String    @map("dispute_id")
  type            String    // 'objection', 'complaint', 'notice'
  content         String    @db.Text
  status          String    @default("draft")
  generatedAt     DateTime  @default(now()) @map("generated_at")
  sentAt          DateTime? @map("sent_at")
  s3Key           String?   @map("s3_key")
  
  dispute         TaxDispute @relation(fields: [disputeId], references: [id])
  
  @@map("tax_dispute_documents")
}

// Таймлайн спора
model TaxDisputeTimeline {
  id              String    @id @default(uuid())
  disputeId       String    @map("dispute_id")
  eventType       String    @map("event_type")
  description     String
  eventDate       DateTime  @default(now()) @map("event_date")
  
  dispute         TaxDispute @relation(fields: [disputeId], references: [id])
  
  @@map("tax_dispute_timeline")
}

// Ставки транспортного налога
model TransportTaxRate {
  id              String    @id @default(uuid())
  region          String
  vehicleType     String    @map("vehicle_type")
  powerMin        Int       @map("power_min")
  powerMax        Int       @map("power_max")
  rate            Decimal   @db.Decimal(10, 2)
  year            Int
  
  @@map("transport_tax_rates")
}

// Шаблоны документов для налоговых споров
model TaxDocumentTemplate {
  id              String    @id @default(uuid())
  name            String
  type            String    // 'objection', 'complaint', 'notice'
  template        String    @db.Text
  variables       Json
  description     String?
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  @@map("tax_document_templates")
}
```

### 6. API Routes

#### 6.1. Налоговые споры
```typescript
// POST /api/tax/disputes
export async function POST(request: Request) {
  const data = await request.json();
  
  // Создание спора
  const dispute = await prisma.taxDispute.create({
    data: {
      userId: data.userId,
      taxType: data.taxType,
      amount: data.amount,
      period: data.period,
      deadline: calculateDeadline(data.deadline Days),
    },
  });
  
  // AI-анализ
  const analyzer = new TaxRequirementAnalyzer();
  const analysis = await analyzer.analyzeTaxRequirement(data);
  
  // Обновление с результатами анализа
  await prisma.taxDispute.update({
    where: { id: dispute.id },
    data: { successRate: analysis.successRate },
  });
  
  return Response.json({ dispute, analysis });
}

// GET /api/tax/disputes/:id
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const dispute = await prisma.taxDispute.findUnique({
    where: { id: params.id },
    include: {
      documents: true,
      timeline: true,
    },
  });
  
  return Response.json({ dispute });
}
```

#### 6.2. Генерация документов
```typescript
// POST /api/tax/documents/generate
export async function POST(request: Request) {
  const data = await request.json();
  
  // Получение шаблона
  const template = await prisma.taxDocumentTemplate.findFirst({
    where: { type: data.documentType },
  });
  
  // Генерация документа с помощью AI
  const generator = new TaxDocumentGenerator();
  const document = await generator.generate({
    template: template.template,
    data: data.formData,
    analysis: data.analysis,
  });
  
  // Сохранение в БД
  const savedDocument = await prisma.taxDisputeDocument.create({
    data: {
      disputeId: data.disputeId,
      type: data.documentType,
      content: document,
      status: 'draft',
    },
  });
  
  return Response.json({ document: savedDocument });
}

// POST /api/tax/documents/:id/export
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const document = await prisma.taxDisputeDocument.findUnique({
    where: { id: params.id },
  });
  
  // Экспорт в PDF
  const pdfGenerator = new PDFGenerator();
  const pdfBuffer = await pdfGenerator.generatePDF(document.content);
  
  // Загрузка в S3
  const s3Key = await uploadToS3(pdfBuffer, `tax-documents/${params.id}.pdf`);
  
  // Обновление записи
  await prisma.taxDisputeDocument.update({
    where: { id: params.id },
    data: { s3Key },
  });
  
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="document-${params.id}.pdf"`,
    },
  });
}
```

#### 6.3. Калькуляторы
```typescript
// POST /api/tax/calculator/transport
export async function POST(request: Request) {
  const data = await request.json();
  
  const calculator = new TransportTaxCalculator();
  const result = await calculator.calculateTransportTax(data);
  
  return Response.json({ result });
}

// POST /api/tax/calculator/penalty
export async function POST(request: Request) {
  const data = await request.json();
  
  const penalty = calculatePenalty({
    taxAmount: data.taxAmount,
    daysOverdue: data.daysOverdue,
    keyRate: await getCurrentKeyRate(),
  });
  
  return Response.json({ penalty });
}
```

## 📅 Детальный план спринтов

### Sprint 1 (1-2 недели): Фундамент
- ✅ Расширение Prisma схемы
- ✅ Создание базовых API routes
- ✅ Шаблоны 3 документов
- ✅ Базовый UI миниаппа (главный экран)

### Sprint 2 (2-3 недели): Генерация документов
- ✅ Step Wizard для создания спора
- ✅ AI-генератор документов
- ✅ Предпросмотр и редактирование
- ✅ Экспорт в PDF/DOCX

### Sprint 3 (1-2 недели): AI-анализ
- ✅ Анализатор налоговых требований
- ✅ Интеграция с RAG системой
- ✅ Расчет шансов на успех
- ✅ Генерация рекомендаций

### Sprint 4 (1-2 недели): Калькуляторы
- ✅ Калькулятор транспортного налога
- ✅ Калькулятор пеней
- ✅ База ставок по регионам
- ✅ UI для калькуляторов

### Sprint 5 (1 неделя): База знаний
- ✅ Загрузка статей НК РФ по налогам
- ✅ Поиск по базе знаний
- ✅ Интеграция с анализатором

### Sprint 6 (1 неделя): Тестирование и полировка
- ✅ E2E тестирование
- ✅ Исправление багов
- ✅ Оптимизация производительности
- ✅ UX улучшения

### Sprint 7 (1 неделя): Деплой и мониторинг
- ✅ Деплой на TimeWeb Cloud
- ✅ Настройка мониторинга
- ✅ Документация
- ✅ Подготовка к запуску

## 🎯 Критерии готовности MVP

### Must have (обязательно)
- ✅ Генерация 3 типов документов
- ✅ AI-анализ требований
- ✅ Калькулятор транспортного налога
- ✅ Экспорт документов в PDF
- ✅ Базовая база знаний (НК РФ)
- ✅ Сохранение истории споров

### Should have (желательно)
- ✅ Редактирование сгенерированных документов
- ✅ Отслеживание дедлайнов
- ✅ Таймлайн спора
- ✅ Telegram уведомления

### Could have (можно отложить)
- ❌ Интеграция с ФНС API (Phase 2)
- ❌ Электронная подпись (Phase 3)
- ❌ Автоматическая отправка (Phase 3)
- ❌ Монетизация (Phase 2)

## 📊 Метрики для отслеживания

### Технические метрики
- 🚀 Время генерации документа: <30 сек
- 🎯 Точность AI-анализа: >80%
- 📱 Скорость загрузки UI: <3 сек
- ⚡ API response time: <1 сек
- 🛡️ Uptime: >99%

### Пользовательские метрики
- 👥 Регистрации: 100+ за месяц
- 📄 Сгенерированные документы: 50+
- ⭐ Средняя оценка: 4.0+
- 🔄 Retention Day 7: >40%
- 📈 Engagement: >2 сессий/пользователь

## 🎉 Следующие шаги после MVP

1. **Сбор обратной связи** - опросы, интервью с пользователями
2. **Анализ метрик** - определение узких мест
3. **Приоритизация фич** - что добавлять в Phase 2
4. **Масштабирование** - подготовка к росту пользователей
5. **Монетизация** - запуск платных тарифов

---

**Следующий шаг:** Начать реализацию Sprint 1 - расширение Prisma схемы и создание базовых API routes.
