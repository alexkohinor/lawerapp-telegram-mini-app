#!/usr/bin/env tsx
/**
 * Quick Test - Быстрое тестирование основного функционала
 */

import consola from 'consola';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void> | void): Promise<void> {
  try {
    consola.start(`Testing: ${name}`);
    await testFn();
    results.push({ name, passed: true });
    consola.success(`✓ ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMessage });
    consola.error(`✗ ${name}: ${errorMessage}`);
  }
}

async function main() {
  consola.box('🧪 LawerApp - Quick Test Suite');
  
  // 1. TypeScript типы
  consola.info('\n1️⃣  TypeScript Types');
  await runTest('Import types', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { z } = require('zod');
  });
  
  // 2. Валидация схем
  consola.info('\n2️⃣  Schema Validation');
  await runTest('Zod schemas', () => {
    const { z } = require('zod');
    const schema = z.object({
      taxType: z.enum(['transport', 'property', 'land']),
      amount: z.number().positive(),
    });
    
    const result = schema.safeParse({ taxType: 'transport', amount: 5000 });
    if (!result.success) throw new Error('Valid data failed validation');
  });
  
  // 3. Файловая структура
  consola.info('\n3️⃣  File Structure');
  await runTest('API routes exist', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const routes = [
      'src/app/api/tax/disputes/route.ts',
      'src/app/api/tax/documents/generate/route.ts',
      'src/app/api/tax/calculator/transport/route.ts',
    ];
    
    for (const route of routes) {
      const filePath = path.join(process.cwd(), route);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing route: ${route}`);
      }
    }
  });
  
  await runTest('Tax services exist', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const services = [
      'src/lib/tax/ai-document-generator.ts',
      'src/lib/tax/ai-tax-analyzer.ts',
      'src/lib/tax/rag-precedent-finder.ts',
      'src/lib/tax/ai-prompt-service.ts',
      'src/lib/tax/document-export-service.ts',
    ];
    
    for (const service of services) {
      const filePath = path.join(process.cwd(), service);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing service: ${service}`);
      }
    }
  });
  
  await runTest('Init scripts exist', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const scripts = [
      'scripts/init-tax-document-templates.ts',
      'scripts/init-transport-tax-rates.ts',
      'scripts/init-ai-prompts.ts',
    ];
    
    for (const script of scripts) {
      const filePath = path.join(process.cwd(), script);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing script: ${script}`);
      }
    }
  });
  
  // 4. Импорты модулей
  consola.info('\n4️⃣  Module Imports');
  await runTest('Import AI services', async () => {
    await import('../src/lib/tax/ai-prompt-service');
  });
  
  await runTest('Import RAG service', async () => {
    await import('../src/lib/tax/rag-precedent-finder');
  });
  
  // 5. Environment
  consola.info('\n5️⃣  Environment');
  await runTest('Check env file', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      consola.warn('  No .env file found (это нормально для тестирования)');
    }
  });
  
  // 6. Prisma
  consola.info('\n6️⃣  Prisma');
  await runTest('Prisma schema exists', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Missing prisma/schema.prisma');
    }
  });
  
  // 7. TypeScript compilation
  consola.info('\n7️⃣  TypeScript Compilation');
  await runTest('Check tsconfig', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      throw new Error('Missing tsconfig.json');
    }
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    if (!tsconfig.compilerOptions) {
      throw new Error('Invalid tsconfig.json');
    }
  });
  
  // Results
  consola.info('\n' + '='.repeat(60));
  consola.box('📊 Test Results');
  
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
  
  consola.info('\n' + '='.repeat(60));
  
  if (failed === 0) {
    consola.success('\n🎉 All quick tests passed!');
    return true;
  } else {
    consola.error('\n❌ Some tests failed.');
    return false;
  }
}

main()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    consola.fatal('Fatal error:', error);
    process.exit(1);
  });

