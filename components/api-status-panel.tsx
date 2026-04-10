/**
 * Painel de teste do backend
 * Mostra o status de conexão com o backend e resultados dos testes
 */

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Globe, Server } from 'lucide-react';
import API_URL from '@/lib/config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApiTestResult {
  name: string;
  passed: boolean;
  status: number | null;
  details: string;
  timestamp: string;
}

export default function ApiStatusPanel() {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    const testResults: ApiTestResult[] = [];

    // Teste 1: Conectividade básica
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        mode: 'cors',
      });
      testResults.push({
        name: 'Conectividade básica',
        passed: response.ok,
        status: response.status,
        details: `HTTP ${response.status}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      testResults.push({
        name: 'Conectividade básica',
        passed: false,
        status: null,
        details: String(err),
        timestamp: new Date().toISOString(),
      });
    }

    // Teste 2: GET /api/folders
    try {
      const response = await fetch(`${API_URL}/api/folders`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      const data = await response.json();
      testResults.push({
        name: 'GET /api/folders',
        passed: response.ok,
        status: response.status,
        details: `HTTP ${response.status} | ${Array.isArray(data) ? data.length : 'N/A'} pastas`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      testResults.push({
        name: 'GET /api/folders',
        passed: false,
        status: null,
        details: String(err),
        timestamp: new Date().toISOString(),
      });
    }

    // Teste 3: CORS
    try {
      const response = await fetch(`${API_URL}/api/folders`, {
        method: 'OPTIONS',
        mode: 'cors',
      });
      const corsOrigin = response.headers.get('access-control-allow-origin');
      testResults.push({
        name: 'CORS Preflight',
        passed: response.ok || response.status === 204,
        status: response.status,
        details: `HTTP ${response.status} | Origin: ${corsOrigin || 'N/A'}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      testResults.push({
        name: 'CORS Preflight',
        passed: false,
        status: null,
        details: String(err),
        timestamp: new Date().toISOString(),
      });
    }

    // Teste 4: POST
    try {
      const response = await fetch(`${API_URL}/api/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test_${Date.now()}`,
          parent_id: null,
        }),
        mode: 'cors',
      });
      testResults.push({
        name: 'POST /api/folders',
        passed: response.ok || response.status === 201,
        status: response.status,
        details: `HTTP ${response.status}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      testResults.push({
        name: 'POST /api/folders',
        passed: false,
        status: null,
        details: String(err),
        timestamp: new Date().toISOString(),
      });
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const allPassed = passed === total && total > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">Status do Backend</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          URL: <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs">{API_URL}</code>
        </p>
      </div>

      {/* Status Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Testes Passaram</div>
            <div className={`text-2xl font-bold ${allPassed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {passed}/{total}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
            <Badge className={`${allPassed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'}`}>
              {allPassed ? '✅ Conectado' : '⚠️ Verificar'}
            </Badge>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3 mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Executando testes...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum teste executado ainda
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.passed
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {result.name}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {result.status && (
                      <span className="inline-block mr-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                        HTTP {result.status}
                      </span>
                    )}
                    {result.details}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Button */}
      <Button
        onClick={runTests}
        disabled={loading}
        className="w-full"
        variant={allPassed && results.length > 0 ? 'secondary' : 'default'}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <Globe className="w-4 h-4 mr-2" />
            {results.length === 0 ? 'Executar Testes' : 'Executar Novamente'}
          </>
        )}
      </Button>

      {/* Info */}
      {allPassed && results.length > 0 && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg text-sm">
          ✅ Frontend conectado com sucesso ao backend em {API_URL}
        </div>
      )}
    </Card>
  );
}
