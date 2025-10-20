'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AppHeader } from '@/components/ui/AppHeader';

interface DocumentForm {
  type: string;
  title: string;
  description: string;
  data: Record<string, unknown>;
}

interface GeneratedDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  downloadUrl: string;
}

const generateMockDocument = (type: string, data: Record<string, unknown>): string => {
  switch (type) {
    case 'claim':
      return `ПРЕТЕНЗИЯ
о нарушении прав потребителя

${data.sellerName || '[Наименование продавца]'}
${data.sellerAddress || '[Адрес продавца]'}

От: ${data.consumerName || '[Ваше ФИО]'}
Адрес: ${data.consumerAddress || '[Ваш адрес]'}

ПРЕТЕНЗИЯ

${new Date().toLocaleDateString('ru-RU')} мной был приобретен товар: ${data.productName || '[Наименование товара]'} за сумму ${data.amount || '[Сумма]'} рублей.

В процессе эксплуатации обнаружены следующие недостатки: ${data.defects || '[Описание недостатков]'}.

Согласно ст. 18 Закона "О защите прав потребителей", при обнаружении недостатков товара потребитель вправе потребовать:
- замены товара на товар надлежащего качества;
- соразмерного уменьшения покупной цены;
- незамедлительного безвозмездного устранения недостатков товара;
- возмещения расходов на устранение недостатков товара;
- возврата уплаченной за товар суммы.

На основании изложенного, прошу:
1. ${data.requirement || 'Заменить товар на товар надлежащего качества'}
2. Возместить причиненные убытки в размере ${data.damages || '0'} рублей

В случае отказа в удовлетворении претензии буду вынужден обратиться в суд с требованием о защите прав потребителя.

Ответ прошу предоставить в письменном виде в течение 10 дней с момента получения претензии.

${data.consumerName || '[Ваше ФИО]'}
${new Date().toLocaleDateString('ru-RU')}`;
    
    case 'contract':
      return `ДОГОВОР ОКАЗАНИЯ УСЛУГ № ${data.contractNumber || '001'}

${new Date().toLocaleDateString('ru-RU')}

Исполнитель: ${data.executorName || '[Наименование исполнителя]'}
Адрес: ${data.executorAddress || '[Адрес исполнителя]'}

Заказчик: ${data.customerName || '[Наименование заказчика]'}
Адрес: ${data.customerAddress || '[Адрес заказчика]'}

ПРЕДМЕТ ДОГОВОРА

1.1. Исполнитель обязуется оказать услуги: ${data.services || '[Описание услуг]'}
1.2. Стоимость услуг: ${data.cost || '[Стоимость]'} рублей

ОБЯЗАННОСТИ СТОРОН

2.1. Исполнитель обязуется:
- Оказать услуги в полном объеме и в установленные сроки
- Обеспечить надлежащее качество оказываемых услуг

2.2. Заказчик обязуется:
- Принять оказанные услуги
- Оплатить услуги в размере и в сроки, установленные договором

ПОРЯДОК РАСЧЕТОВ

3.1. Стоимость услуг составляет ${data.cost || '[Стоимость]'} рублей
3.2. Оплата производится ${data.paymentTerms || '[Условия оплаты]'}

ОТВЕТСТВЕННОСТЬ СТОРОН

4.1. За неисполнение или ненадлежащее исполнение обязательств стороны несут ответственность в соответствии с действующим законодательством

ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ

5.1. Договор вступает в силу с момента подписания
5.2. Все споры решаются путем переговоров, а при недостижении согласия - в судебном порядке

ИСПОЛНИТЕЛЬ:                    ЗАКАЗЧИК:
${data.executorName || '[ФИО]'}                    ${data.customerName || '[ФИО]'}`;
    
    case 'complaint':
      return `ЖАЛОБА
в Роспотребнадзор

В Управление Роспотребнадзора по ${data.region || '[Регион]'}

От: ${data.complainantName || '[Ваше ФИО]'}
Адрес: ${data.complainantAddress || '[Ваш адрес]'}
Телефон: ${data.phone || '[Ваш телефон]'}

ЖАЛОБА

${new Date().toLocaleDateString('ru-RU')} мной была подана претензия в адрес ${data.companyName || '[Наименование организации]'} по поводу ${data.issue || '[Описание проблемы]'}.

В нарушение ст. 18 Закона "О защите прав потребителей" моя претензия была оставлена без ответа (или получен неудовлетворительный ответ).

Прошу:
1. Провести проверку деятельности ${data.companyName || '[Наименование организации]'}
2. Принять меры по защите моих прав как потребителя
3. Привлечь нарушителя к административной ответственности

Прилагаю копии документов, подтверждающих изложенные обстоятельства.

${data.complainantName || '[Ваше ФИО]'}
${new Date().toLocaleDateString('ru-RU')}`;
    
    default:
      return `ПРАВОВОЙ ДОКУМЕНТ

Дата: ${new Date().toLocaleDateString('ru-RU')}

${data.content || '[Содержание документа]'}

Документ подготовлен на основе предоставленных данных и действующего законодательства РФ.

Рекомендации:
- Перед использованием документа проконсультируйтесь с юристом
- Проверьте актуальность ссылок на нормативные акты
- При необходимости внесите корректировки с учетом конкретных обстоятельств`;
  }
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [form, setForm] = useState<DocumentForm>({
    type: 'claim',
    title: '',
    description: '',
    data: {}
  });

  const documentTypes = [
    { id: 'claim', name: 'Претензия', description: 'Претензия о нарушении прав потребителя' },
    { id: 'contract', name: 'Договор', description: 'Договор оказания услуг' },
    { id: 'complaint', name: 'Жалоба', description: 'Жалоба в Роспотребнадзор' },
    { id: 'other', name: 'Другой документ', description: 'Иной правовой документ' }
  ];

  const handleGenerateDocument = async () => {
    if (!form.title.trim()) {
      alert('Пожалуйста, введите название документа');
      return;
    }

    setIsGenerating(true);

    try {
      // Mock document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const document = {
        id: `doc_${Date.now()}`,
        type: form.type,
        title: form.title,
        content: generateMockDocument(form.type, form.data),
        status: 'generated',
        createdAt: new Date().toISOString(),
        downloadUrl: '#'
      };
      setDocuments(prev => [document, ...prev]);
      setForm({
        type: 'claim',
        title: '',
        description: '',
        data: {}
      });
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Ошибка при генерации документа. Попробуйте еще раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDocument = (document: GeneratedDocument) => {
    setSelectedDocument(document);
  };

  const handleDownloadDocument = (doc: GeneratedDocument) => {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFormFields = () => {
    switch (form.type) {
      case 'claim':
        return (
          <div className="space-y-4">
            <Input
              label="Наименование продавца"
              value={(form.data.sellerName as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, sellerName: e.target.value }
              }))}
              placeholder="ООО 'Название компании'"
            />
            <Input
              label="Адрес продавца"
              value={(form.data.sellerAddress as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, sellerAddress: e.target.value }
              }))}
              placeholder="г. Москва, ул. Примерная, д. 1"
            />
            <Input
              label="Наименование товара"
              value={(form.data.productName as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, productName: e.target.value }
              }))}
              placeholder="Товар/услуга"
            />
            <Input
              label="Сумма покупки"
              value={(form.data.amount as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, amount: e.target.value }
              }))}
              placeholder="1000"
            />
            <Input
              label="Описание недостатков"
              value={(form.data.defects as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, defects: e.target.value }
              }))}
              placeholder="Опишите обнаруженные недостатки"
            />
          </div>
        );
      
      case 'contract':
        return (
          <div className="space-y-4">
            <Input
              label="Наименование исполнителя"
              value={(form.data.executorName as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, executorName: e.target.value }
              }))}
              placeholder="ООО 'Исполнитель'"
            />
            <Input
              label="Наименование заказчика"
              value={(form.data.customerName as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, customerName: e.target.value }
              }))}
              placeholder="ООО 'Заказчик'"
            />
            <Input
              label="Описание услуг"
              value={(form.data.services as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, services: e.target.value }
              }))}
              placeholder="Консультационные услуги"
            />
            <Input
              label="Стоимость услуг"
              value={(form.data.cost as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, cost: e.target.value }
              }))}
              placeholder="50000"
            />
          </div>
        );
      
      case 'complaint':
        return (
          <div className="space-y-4">
            <Input
              label="Наименование организации"
              value={(form.data.companyName as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, companyName: e.target.value }
              }))}
              placeholder="ООО 'Нарушитель'"
            />
            <Input
              label="Регион"
              value={(form.data.region as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, region: e.target.value }
              }))}
              placeholder="Московская область"
            />
            <Input
              label="Описание проблемы"
              value={(form.data.issue as string) || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                data: { ...prev.data, issue: e.target.value }
              }))}
              placeholder="Опишите суть проблемы"
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержание документа
              </label>
              <textarea
                value={(form.data.content as string) || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  data: { ...prev.data, content: e.target.value }
                }))}
                placeholder="Опишите, какой документ вам нужен"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container-narrow">
      <AppHeader title="Генерация документов" showBack onBack={() => history.back()} />
      <div className="section text-muted">Создавайте правовые документы с помощью AI</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Generation Form */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Создать новый документ</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип документа
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Название документа"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите название документа"
              />

              <Input
                label="Описание"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Дополнительное описание (необязательно)"
              />

              {renderFormFields()}

              <Button
                onClick={handleGenerateDocument}
                loading={isGenerating}
                disabled={!form.title.trim()}
                className="w-full"
              >
                {isGenerating ? 'Генерирую документ...' : 'Создать документ'}
              </Button>
            </div>
          </Card>

          {/* Generated Documents List */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Созданные документы</h2>
            
            {documents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">📄</div>
                <p>Документы не созданы</p>
                <p className="text-sm">Создайте свой первый документ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          doc.status === 'generated' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status === 'generated' ? 'Готов' : 'В обработке'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDocument(doc)}
                        >
                          Просмотр
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          Скачать
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Document Preview Modal */}
        <Modal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          title={selectedDocument?.title}
          size="xl"
        >
          {selectedDocument && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                  {selectedDocument.content}
                </pre>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDocument(null)}
                >
                  Закрыть
                </Button>
                <Button
                  onClick={() => handleDownloadDocument(selectedDocument)}
                >
                  Скачать
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
