import API_URL from './config';

export async function testBackendConnection() {
  const tests = {
    apiUrl: API_URL,
    tests: [] as any[],
  };

  // Teste 1: Conexão básica (Health Check)
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: 'GET',
    });
    tests.tests.push({
      name: 'Health Check',
      status: res.ok ? '✅' : '❌',
      code: res.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    tests.tests.push({
      name: 'Health Check',
      status: '❌',
      error: String(error),
      timestamp: new Date().toISOString(),
    });
  }

  // Teste 2: Listar pastas
  try {
    const res = await fetch(`${API_URL}/api/folders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    tests.tests.push({
      name: 'GET /api/folders',
      status: res.ok ? '✅' : '❌',
      code: res.status,
      dataCount: Array.isArray(data) ? data.length : 'N/A',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    tests.tests.push({
      name: 'GET /api/folders',
      status: '❌',
      error: String(error),
      timestamp: new Date().toISOString(),
    });
  }

  // Teste 3: CORS
  try {
    const res = await fetch(`${API_URL}/api/folders`, {
      method: 'OPTIONS',
    });
    tests.tests.push({
      name: 'CORS Check',
      status: res.ok ? '✅' : '⚠️',
      code: res.status,
      corsHeaders: {
        'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': res.headers.get('access-control-allow-methods'),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    tests.tests.push({
      name: 'CORS Check',
      status: '❌',
      error: String(error),
      timestamp: new Date().toISOString(),
    });
  }

  // Teste 4: Teste de requisição POST (criar pasta teste)
  try {
    const res = await fetch(`${API_URL}/api/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test_Folder', parent_id: null }),
    });
    tests.tests.push({
      name: 'POST /api/folders (Create)',
      status: res.ok ? '✅' : '❌',
      code: res.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    tests.tests.push({
      name: 'POST /api/folders (Create)',
      status: '❌',
      error: String(error),
      timestamp: new Date().toISOString(),
    });
  }

  return tests;
}
