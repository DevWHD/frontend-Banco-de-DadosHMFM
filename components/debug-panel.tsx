'use client';

import { useState } from 'react';
import { testBackendConnection } from '@/lib/debug-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import API_URL from '@/lib/config';
import { X } from 'lucide-react';

export default function DebugPanel() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = await testBackendConnection();
    setResults(testResults);
    setLoading(false);
    console.log('Test Results:', testResults);
  };

  // Apenas mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          title="Abrir painel de debug"
        >
          🔧
        </Button>
      ) : (
        <Card className="bg-card border border-border rounded-lg p-4 shadow-lg max-w-md">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm font-bold">🔧 Debug Panel</div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-muted-foreground break-all">
              API URL: <code className="bg-muted p-1 rounded block mt-1">{API_URL}</code>
            </div>

            <Button
              size="sm"
              onClick={runTests}
              disabled={loading}
              className="w-full"
            >
              {loading ? '⏳ Testando...' : '▶️ Executar Testes'}
            </Button>

            {results && (
              <div className="text-xs space-y-2 max-h-96 overflow-auto border-t border-border pt-3">
                <div className="font-semibold">📊 Resultados:</div>
                {results.tests.map((test: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary pl-2 py-1">
                    <div className="font-medium">{test.status} {test.name}</div>
                    {test.code && (
                      <div className="text-muted-foreground">HTTP {test.code}</div>
                    )}
                    {test.dataCount && (
                      <div className="text-muted-foreground">Items: {test.dataCount}</div>
                    )}
                    {test.error && (
                      <div className="text-destructive break-all">{test.error}</div>
                    )}
                    {test.corsHeaders && (
                      <div className="text-muted-foreground text-xs">
                        <div>CORS: {test.corsHeaders['access-control-allow-origin']}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
