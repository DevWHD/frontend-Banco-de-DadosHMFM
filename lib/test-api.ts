/**
 * Teste de integração do Frontend com Backend
 * Executar: npm run test:backend
 */

import API_URL from '@/lib/config';

interface TestResult {
  name: string;
  passed: boolean;
  status: number | null;
  details: string;
  timestamp: string;
}

async function testBackendAPI(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('\n' + '='.repeat(70));
  console.log('🔧 TESTES DE INTEGRAÇÃO FRONTEND-BACKEND');
  console.log('='.repeat(70));
  console.log(`📍 Backend URL: ${API_URL}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  // Teste 1: Conectividade básica
  try {
    console.log('▶️  Teste 1: Conectividade básica...');
    const response = await fetch(API_URL, {
      method: 'GET',
      mode: 'cors',
    });
    
    results.push({
      name: 'Conectividade básica',
      passed: response.ok,
      status: response.status,
      details: `HTTP ${response.status}`,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Teste 1 concluído\n`);
  } catch (error) {
    results.push({
      name: 'Conectividade básica',
      passed: false,
      status: null,
      details: String(error),
      timestamp: new Date().toISOString(),
    });
    console.log(`❌ Teste 1 falhou: ${error}\n`);
  }

  // Teste 2: GET /api/folders
  try {
    console.log('▶️  Teste 2: GET /api/folders...');
    const response = await fetch(`${API_URL}/api/folders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    const data = await response.json();
    results.push({
      name: 'GET /api/folders',
      passed: response.ok,
      status: response.status,
      details: `HTTP ${response.status} | ${Array.isArray(data) ? data.length : 'N/A'} pastas`,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Teste 2 concluído: ${Array.isArray(data) ? data.length : 0} pastas encontradas\n`);
  } catch (error) {
    results.push({
      name: 'GET /api/folders',
      passed: false,
      status: null,
      details: String(error),
      timestamp: new Date().toISOString(),
    });
    console.log(`❌ Teste 2 falhou: ${error}\n`);
  }

  // Teste 3: CORS Preflight
  try {
    console.log('▶️  Teste 3: Preflight CORS (OPTIONS)...');
    const response = await fetch(`${API_URL}/api/folders`, {
      method: 'OPTIONS',
      mode: 'cors',
    });
    
    const corsOrigin = response.headers.get('access-control-allow-origin');
    const corsMethods = response.headers.get('access-control-allow-methods');
    
    results.push({
      name: 'CORS Preflight',
      passed: response.ok || response.status === 204,
      status: response.status,
      details: `HTTP ${response.status} | Origin: ${corsOrigin || 'N/A'} | Methods: ${corsMethods || 'N/A'}`,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Teste 3 concluído\n`);
  } catch (error) {
    results.push({
      name: 'CORS Preflight',
      passed: false,
      status: null,
      details: String(error),
      timestamp: new Date().toISOString(),
    });
    console.log(`❌ Teste 3 falhou: ${error}\n`);
  }

  // Teste 4: POST /api/folders
  try {
    console.log('▶️  Teste 4: POST /api/folders (criar pasta)...');
    const response = await fetch(`${API_URL}/api/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Test_Pasta_${Date.now()}`,
        parent_id: null,
      }),
      mode: 'cors',
    });
    
    results.push({
      name: 'POST /api/folders',
      passed: response.ok || response.status === 201,
      status: response.status,
      details: `HTTP ${response.status}`,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Teste 4 concluído\n`);
  } catch (error) {
    results.push({
      name: 'POST /api/folders',
      passed: false,
      status: null,
      details: String(error),
      timestamp: new Date().toISOString(),
    });
    console.log(`❌ Teste 4 falhou: ${error}\n`);
  }

  // Teste 5: Erro 404
  try {
    console.log('▶️  Teste 5: Tratamento de erro (404)...');
    const response = await fetch(`${API_URL}/api/endpoint-inexistente`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    results.push({
      name: 'Tratamento de erro (404)',
      passed: response.status === 404,
      status: response.status,
      details: `HTTP ${response.status}`,
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Teste 5 concluído\n`);
  } catch (error) {
    results.push({
      name: 'Tratamento de erro (404)',
      passed: false,
      status: null,
      details: String(error),
      timestamp: new Date().toISOString(),
    });
    console.log(`❌ Teste 5 falhou: ${error}\n`);
  }

  // Resumo
  console.log('='.repeat(70));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(70) + '\n');

  results.forEach((result, index) => {
    const emoji = result.passed ? '✅' : '❌';
    console.log(`${emoji} ${index + 1}. ${result.name}`);
    console.log(`   Status: ${result.status || 'N/A'}`);
    console.log(`   Detalhes: ${result.details}\n`);
  });

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log('='.repeat(70));
  console.log(`\n✅ Passou: ${passed}/${total}`);
  console.log(`❌ Falhou: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 Todos os testes passaram com sucesso!');
  } else {
    console.log(`\n⚠️  ${total - passed} teste(s) falharam.`);
  }

  console.log('='.repeat(70) + '\n');

  return results;
}

// Executar testes se for usado como script
if (typeof window === 'undefined') {
  testBackendAPI().then(results => {
    process.exit(results.every(r => r.passed) ? 0 : 1);
  });
}

export default testBackendAPI;
