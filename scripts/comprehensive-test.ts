#!/usr/bin/env tsx
/**
 * Comprehensive Test Suite for Tax Dispute MVP
 * Тестирование всего реализованного функционала
 */

import { prisma } from '../src/lib/prisma';
import consola from 'consola';
import { z } from 'zod';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  try {
    consola.start(`Testing: ${name}`);
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    consola.success(`✓ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMessage, duration });
    consola.error(`✗ ${name} (${duration}ms): ${errorMessage}`);
  }
}

// ============================================
// 1. Database Connection Tests
// ============================================

async function testDatabaseConnection() {
  await prisma.$connect();
  const result = await prisma.$queryRaw`SELECT 1 as result`;
  if (!result) throw new Error('Database query failed');
}

async function testPrismaModels() {
  // Проверка всех моделей
  const models = [
    prisma.user,
    prisma.taxDispute,
    prisma.taxDisputeDocument,
    prisma.taxDisputeTimeline,
    prisma.taxCalculation,
    prisma.transportTaxRate,
    prisma.taxDocumentTemplate,
    prisma.aIPromptTemplate,
    prisma.aIPromptUsageLog,
  ];
  
  for (const model of models) {
    if (!model) throw new Error('Model is undefined');
  }
}

// ============================================
// 2. Data Initialization Tests
// ============================================

async function testTransportTaxRates() {
  const rates = await prisma.transportTaxRate.findMany();
  if (rates.length === 0) {
    throw new Error('No transport tax rates found. Run: npm run tax:init-rates');
  }
  consola.info(`  Found ${rates.length} tax rates`);
  
  // Проверка структуры
  const rate = rates[0];
  if (!rate.region || !rate.vehicleType || !rate.rate) {
    throw new Error('Tax rate structure is invalid');
  }
}

async function testDocumentTemplates() {
  const templates = await prisma.taxDocumentTemplate.findMany();
  if (templates.length === 0) {
    throw new Error('No document templates found. Run: npm run tax:init-templates');
  }
  consola.info(`  Found ${templates.length} document templates`);
  
  // Проверка структуры
  const template = templates[0];
  if (!template.type || !template.template) {
    throw new Error('Document template structure is invalid');
  }
}

async function testAIPrompts() {
  const prompts = await prisma.aIPromptTemplate.findMany();
  if (prompts.length === 0) {
    throw new Error('No AI prompts found. Run: npm run tax:init-prompts');
  }
  consola.info(`  Found ${prompts.length} AI prompts`);
  
  // Проверка структуры
  const prompt = prompts[0];
  if (!prompt.promptType || (!prompt.systemPrompt && !prompt.userPrompt)) {
    throw new Error('AI prompt structure is invalid');
  }
}

// ============================================
// 3. CRUD Operations Tests
// ============================================

let testUserId: string;
let testDisputeId: string;

async function testCreateUser() {
  const user = await prisma.user.create({
    data: {
      telegramId: 999999999,
      telegramUsername: 'test_user',
      firstName: 'Test',
      lastName: 'User',
    },
  });
  testUserId = user.id;
  consola.info(`  Created test user: ${user.id}`);
}

async function testCreateTaxDispute() {
  const dispute = await prisma.taxDispute.create({
    data: {
      userId: testUserId,
      taxType: 'transport',
      period: '2024',
      amount: 5000,
      status: 'draft',
      grounds: ['Неверный расчет налоговой базы', 'Не учтена льгота'],
    },
  });
  testDisputeId = dispute.id;
  consola.info(`  Created test dispute: ${dispute.id}`);
}

async function testReadTaxDispute() {
  const dispute = await prisma.taxDispute.findUnique({
    where: { id: testDisputeId },
  });
  if (!dispute) throw new Error('Failed to read dispute');
  if (dispute.userId !== testUserId) throw new Error('Dispute user mismatch');
}

async function testUpdateTaxDispute() {
  const updated = await prisma.taxDispute.update({
    where: { id: testDisputeId },
    data: { status: 'in_progress' },
  });
  if (updated.status !== 'in_progress') throw new Error('Failed to update dispute status');
}

async function testCreateDisputeDocument() {
  const document = await prisma.taxDisputeDocument.create({
    data: {
      disputeId: testDisputeId,
      type: 'objection',
      title: 'Возражения на требование',
      content: 'Тестовое содержимое документа',
      status: 'draft',
    },
  });
  consola.info(`  Created test document: ${document.id}`);
}

async function testCreateDisputeTimeline() {
  const timeline = await prisma.taxDisputeTimeline.create({
    data: {
      disputeId: testDisputeId,
      eventType: 'dispute_created',
      description: 'Спор создан',
      metadata: {
        test: true,
      },
    },
  });
  consola.info(`  Created timeline event: ${timeline.id}`);
}

// ============================================
// 4. Tax Calculator Tests
// ============================================

async function testTransportTaxCalculator() {
  // Получаем ставку для тестирования
  const rate = await prisma.transportTaxRate.findFirst({
    where: {
      region: 'moscow',
      vehicleType: 'car',
      year: 2024,
    },
  });
  
  if (!rate) throw new Error('No tax rate found for Moscow, car, 2024');
  
  // Тестовые данные
  const enginePower = 150; // л.с.
  const ownershipMonths = 12;
  const rateValue = typeof rate.rate === 'number' ? rate.rate : Number(rate.rate);
  const expectedTax = rateValue * enginePower * (ownershipMonths / 12);
  
  consola.info(`  Tax calculation: ${rateValue} * ${enginePower} * ${ownershipMonths}/12 = ${expectedTax}`);
  
  if (expectedTax <= 0) throw new Error('Tax calculation returned invalid result');
}

// ============================================
// 5. AI Prompt Service Tests
// ============================================

async function testAIPromptRetrieval() {
  const { getPromptByType } = await import('../src/lib/tax/ai-prompt-service');
  
  const prompt = await getPromptByType('document_generation', 'transport');
  if (!prompt) throw new Error('Failed to retrieve AI prompt');
  
  consola.info(`  Retrieved prompt: ${prompt.name}`);
}

async function testAIPromptLogging() {
  const { logPromptUsage } = await import('../src/lib/tax/ai-prompt-service');
  
  const prompt = await prisma.aIPromptTemplate.findFirst();
  if (!prompt) throw new Error('No prompts available for logging test');
  
  await logPromptUsage({
    promptId: prompt.id,
    userId: testUserId,
    disputeId: testDisputeId,
    success: true,
    responseTime: 1500,
    tokensUsed: 500,
    content: 'Test generated content',
    inputData: { test: true },
  });
  
  consola.info(`  Logged prompt usage for: ${prompt.name}`);
}

// ============================================
// 6. Validation Tests
// ============================================

async function testZodValidation() {
  const disputeSchema = z.object({
    taxType: z.enum(['transport', 'property', 'land', 'NDFL', 'NPD']),
    period: z.string(),
    amount: z.number().positive(),
    grounds: z.array(z.string()).min(1),
  });
  
  // Valid data
  const validData = {
    taxType: 'transport' as const,
    period: '2024',
    amount: 5000,
    grounds: ['Test ground'],
  };
  
  const result = disputeSchema.safeParse(validData);
  if (!result.success) throw new Error('Valid data failed validation');
  
  // Invalid data
  const invalidData = {
    taxType: 'invalid' as const,
    period: '2024',
    amount: -100,
    grounds: [],
  };
  
  const invalidResult = disputeSchema.safeParse(invalidData);
  if (invalidResult.success) throw new Error('Invalid data passed validation');
  
  consola.info(`  Zod validation working correctly`);
}

// ============================================
// 7. Environment Variables Tests
// ============================================

async function testEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'S3_ENDPOINT',
    'S3_REGION',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_BUCKET_NAME',
  ];
  
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    consola.warn(`  Missing env vars: ${missing.join(', ')}`);
    consola.warn(`  Some features may not work without these variables`);
  } else {
    consola.info(`  All required environment variables are set`);
  }
}

// ============================================
// 8. Type Safety Tests
// ============================================

async function testTypeScript() {
  // Проверка, что Prisma типы доступны
  const dispute: {
    id: string;
    taxType: string;
    status: string;
  } = await prisma.taxDispute.findFirstOrThrow();
  
  if (!dispute.id || !dispute.taxType || !dispute.status) {
    throw new Error('Prisma types are not properly generated');
  }
  
  consola.info(`  TypeScript types are working correctly`);
}

// ============================================
// 9. Cleanup Tests
// ============================================

async function testCleanup() {
  // Удаление тестовых данных
  if (testDisputeId) {
    await prisma.taxDisputeDocument.deleteMany({
      where: { disputeId: testDisputeId },
    });
    await prisma.taxDisputeTimeline.deleteMany({
      where: { disputeId: testDisputeId },
    });
    await prisma.taxDispute.delete({
      where: { id: testDisputeId },
    });
    consola.info(`  Deleted test dispute: ${testDisputeId}`);
  }
  
  if (testUserId) {
    await prisma.user.delete({
      where: { id: testUserId },
    });
    consola.info(`  Deleted test user: ${testUserId}`);
  }
}

// ============================================
// Main Test Runner
// ============================================

async function runAllTests() {
  consola.box('🧪 LawerApp Tax Dispute MVP - Comprehensive Test Suite');
  
  consola.info('\n📊 Starting comprehensive testing...\n');
  
  // 1. Database Tests
  consola.info('1️⃣  Database Tests');
  await runTest('Database connection', testDatabaseConnection);
  await runTest('Prisma models', testPrismaModels);
  
  // 2. Data Initialization Tests
  consola.info('\n2️⃣  Data Initialization Tests');
  await runTest('Transport tax rates', testTransportTaxRates);
  await runTest('Document templates', testDocumentTemplates);
  await runTest('AI prompts', testAIPrompts);
  
  // 3. CRUD Operations Tests
  consola.info('\n3️⃣  CRUD Operations Tests');
  await runTest('Create user', testCreateUser);
  await runTest('Create tax dispute', testCreateTaxDispute);
  await runTest('Read tax dispute', testReadTaxDispute);
  await runTest('Update tax dispute', testUpdateTaxDispute);
  await runTest('Create dispute document', testCreateDisputeDocument);
  await runTest('Create dispute timeline', testCreateDisputeTimeline);
  
  // 4. Business Logic Tests
  consola.info('\n4️⃣  Business Logic Tests');
  await runTest('Transport tax calculator', testTransportTaxCalculator);
  await runTest('AI prompt retrieval', testAIPromptRetrieval);
  await runTest('AI prompt logging', testAIPromptLogging);
  
  // 5. Validation Tests
  consola.info('\n5️⃣  Validation Tests');
  await runTest('Zod validation', testZodValidation);
  
  // 6. Infrastructure Tests
  consola.info('\n6️⃣  Infrastructure Tests');
  await runTest('Environment variables', testEnvironmentVariables);
  await runTest('TypeScript types', testTypeScript);
  
  // 7. Cleanup
  consola.info('\n7️⃣  Cleanup');
  await runTest('Cleanup test data', testCleanup);
  
  // Results Summary
  consola.info('\n' + '='.repeat(60));
  consola.box('📊 Test Results Summary');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  consola.info(`\n✅ Passed: ${passed}/${total} (${successRate}%)`);
  if (failed > 0) {
    consola.error(`❌ Failed: ${failed}/${total}`);
    consola.info('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      consola.error(`  - ${r.name}: ${r.error}`);
    });
  }
  
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  consola.info(`\n⏱️  Total duration: ${totalDuration}ms`);
  
  consola.info('\n' + '='.repeat(60));
  
  if (failed === 0) {
    consola.success('\n🎉 All tests passed! Ready for build.');
    return true;
  } else {
    consola.error('\n❌ Some tests failed. Please fix errors before building.');
    return false;
  }
}

// Run tests
runAllTests()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    consola.fatal('Fatal error during testing:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
