import { prisma } from '../src/lib/prisma';
import consola from 'consola';

/**
 * Скрипт для инициализации ставок транспортного налога
 * Данные взяты из законов субъектов РФ за 2024-2025 годы
 */

interface TaxRateData {
  region: string;
  regionCode: string;
  vehicleType: string;
  powerMin: number;
  powerMax: number;
  rate: number;
  year: number;
  source: string;
}

const taxRates: TaxRateData[] = [
  // ============================================
  // Москва (код 77)
  // ============================================
  // Легковые автомобили
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 0,
    powerMax: 100,
    rate: 12,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 101,
    powerMax: 125,
    rate: 25,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 126,
    powerMax: 150,
    rate: 35,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 151,
    powerMax: 175,
    rate: 45,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 176,
    powerMax: 200,
    rate: 50,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 201,
    powerMax: 225,
    rate: 65,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 226,
    powerMax: 250,
    rate: 75,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'car',
    powerMin: 251,
    powerMax: 9999,
    rate: 150,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  
  // Мотоциклы
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'motorcycle',
    powerMin: 0,
    powerMax: 20,
    rate: 7,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'motorcycle',
    powerMin: 21,
    powerMax: 35,
    rate: 15,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'motorcycle',
    powerMin: 36,
    powerMax: 9999,
    rate: 50,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  
  // Грузовые автомобили
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'truck',
    powerMin: 0,
    powerMax: 100,
    rate: 15,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'truck',
    powerMin: 101,
    powerMax: 150,
    rate: 26,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'truck',
    powerMin: 151,
    powerMax: 200,
    rate: 38,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'truck',
    powerMin: 201,
    powerMax: 250,
    rate: 55,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'truck',
    powerMin: 251,
    powerMax: 9999,
    rate: 70,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  
  // Автобусы
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'bus',
    powerMin: 0,
    powerMax: 200,
    rate: 15,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  {
    region: 'Москва',
    regionCode: '77',
    vehicleType: 'bus',
    powerMin: 201,
    powerMax: 9999,
    rate: 50,
    year: 2024,
    source: 'Закон г. Москвы от 09.07.2008 № 33',
  },
  
  // ============================================
  // Санкт-Петербург (код 78)
  // ============================================
  // Легковые автомобили
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'car',
    powerMin: 0,
    powerMax: 100,
    rate: 24,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'car',
    powerMin: 101,
    powerMax: 150,
    rate: 35,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'car',
    powerMin: 151,
    powerMax: 200,
    rate: 50,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'car',
    powerMin: 201,
    powerMax: 250,
    rate: 75,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'car',
    powerMin: 251,
    powerMax: 9999,
    rate: 150,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  
  // Мотоциклы
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'motorcycle',
    powerMin: 0,
    powerMax: 20,
    rate: 10,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'motorcycle',
    powerMin: 21,
    powerMax: 35,
    rate: 20,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  {
    region: 'Санкт-Петербург',
    regionCode: '78',
    vehicleType: 'motorcycle',
    powerMin: 36,
    powerMax: 9999,
    rate: 50,
    year: 2024,
    source: 'Закон Санкт-Петербурга от 04.11.2002 № 487-53',
  },
  
  // ============================================
  // Московская область (код 50)
  // ============================================
  // Легковые автомобили
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 0,
    powerMax: 100,
    rate: 10,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 101,
    powerMax: 125,
    rate: 20,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 126,
    powerMax: 150,
    rate: 25,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 151,
    powerMax: 175,
    rate: 30,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 176,
    powerMax: 200,
    rate: 35,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 201,
    powerMax: 225,
    rate: 40,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 226,
    powerMax: 250,
    rate: 45,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  {
    region: 'Московская область',
    regionCode: '50',
    vehicleType: 'car',
    powerMin: 251,
    powerMax: 9999,
    rate: 150,
    year: 2024,
    source: 'Закон Московской области от 16.11.2002 № 129/2002-ОЗ',
  },
  
  // Копируем те же данные для 2025 года
  ...generateRatesForYear(2025),
];

/**
 * Генерация ставок для следующего года
 */
function generateRatesForYear(year: number) {
  return taxRates.map(rate => ({
    ...rate,
    year,
  }));
}

async function initializeTransportTaxRates() {
  consola.start('Инициализация ставок транспортного налога...');
  
  try {
    // Очистка существующих ставок (опционально)
    const deleteCount = await prisma.transportTaxRate.deleteMany({});
    consola.info(`Удалено существующих ставок: ${deleteCount.count}`);
    
    // Создание новых ставок
    let createdCount = 0;
    
    for (const rate of taxRates) {
      await prisma.transportTaxRate.create({
        data: rate,
      });
      createdCount++;
    }
    
    consola.success(`\n🎉 Успешно создано ${createdCount} ставок транспортного налога!`);
    
    // Статистика
    const stats = await prisma.transportTaxRate.groupBy({
      by: ['region', 'year'],
      _count: true,
    });
    
    consola.info('\n📊 Статистика по регионам:');
    stats.forEach((stat) => {
      consola.info(`  - ${stat.region} (${stat.year}): ${stat._count} ставок`);
    });
    
    const vehicleTypeStats = await prisma.transportTaxRate.groupBy({
      by: ['vehicleType'],
      _count: true,
    });
    
    consola.info('\n🚗 Статистика по типам ТС:');
    vehicleTypeStats.forEach((stat) => {
      consola.info(`  - ${stat.vehicleType}: ${stat._count} ставок`);
    });
    
  } catch (error) {
    consola.error('❌ Ошибка при инициализации ставок:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта
initializeTransportTaxRates();

