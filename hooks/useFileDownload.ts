'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para download seguro de arquivos
 * 
 * Características:
 * ✅ Validação de URL antes de usar
 * ✅ Try/catch para capturar erros
 * ✅ Fallback via API
 * ✅ Feedback ao usuário
 * ✅ Logging para debug
 */
export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Download direto via blob_url
   */
  const downloadFile = useCallback(async (
    fileUrl: string | null | undefined,
    fileName: string,
    options?: {
      fallbackApiUrl?: string;
      fileId?: number;
    }
  ) => {
    // ❌ Verificar se URL existe
    if (!fileUrl) {
      // Tentar fallback via API se disponível
      if (options?.fallbackApiUrl && options?.fileId) {
        return downloadViaAPI(
          options.fallbackApiUrl,
          options.fileId,
          fileName
        );
      }

      const errorMsg = "URL de download não disponível para este arquivo";
      toast.error(errorMsg);
      setError(errorMsg);
      console.warn('[Download] URL ausente para arquivo:', fileName);
      return;
    }

    // ❌ Verificar se é URL válida
    try {
      new URL(fileUrl);
    } catch (e) {
      const errorMsg = "URL de download inválida";
      toast.error(errorMsg);
      setError(errorMsg);
      console.error('[Download] URL inválida:', fileUrl);
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      // ✅ Criar elemento de download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // ✅ Disparar download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // ✅ Feedback positivo
      toast.success(`Arquivo ${fileName} sendo baixado...`);
      setError(null);
      console.log('[Download] Sucesso:', fileName);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao baixar: ${errorMsg}`);
      setError(errorMsg);
      console.error('[Download Error]', errorMsg, err);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  /**
   * Download via API (fallback)
   * Usado quando blob_url não está disponível
   */
  const downloadViaAPI = useCallback(async (
    apiUrl: string,
    fileId: number,
    fileName: string
  ) => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl}/api/files/${fileId}/download`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/octet-stream',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success(`Arquivo ${fileName} baixado via API`);
      setError(null);
      console.log('[API Download] Sucesso:', fileName);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao baixar: ${errorMsg}`);
      setError(errorMsg);
      console.error('[API Download Error]', errorMsg, err);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isDownloading,
    error,
    downloadFile,
    downloadViaAPI,
  };
}
