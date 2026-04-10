# 🛠️ Guia Prático: Corrigir Erros de Download

**Objetivo:** Implementar as correções para o sistema de download funcionando corretamente.

---

## 🎯 Solução Completa

### PASSO 1: Validar Dados com Zod

**Arquivo a Criar:** `lib/schemas.ts`

```typescript
import { z } from 'zod';

// ✅ Validar FileItem em runtime
export const FileItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Nome é obrigatório"),
  folder_id: z.number().int().positive(),
  blob_url: z.string().url("blob_url deve ser uma URL válida"),
  size: z.number().int().nonnegative(),
  mime_type: z.string(),
  created_at: z.string().datetime(),
});

export type FileItem = z.infer<typeof FileItemSchema>;

// ✅ Validar FolderItem
export const FolderItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  parent_id: z.number().int().nonnegative().nullable(),
  password: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

export type FolderItem = z.infer<typeof FolderItemSchema>;
```

**Status:** ✅ Zod já está no `package.json`

---

### PASSO 2: Criar Hook para Download Seguro

**Arquivo a Criar:** `hooks/useFileDownload.ts`

```typescript
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface DownloadProgress {
  isDownloading: boolean;
  error: string | null;
}

export function useFileDownload() {
  const [progress, setProgress] = useState<DownloadProgress>({
    isDownloading: false,
    error: null,
  });

  const downloadFile = useCallback(async (
    fileUrl: string | null | undefined,
    fileName: string,
    fallbackApiUrl?: string,
    fileId?: number
  ) => {
    // 1️⃣ Validar URL
    if (!fileUrl) {
      // Tentar fallback via API
      if (fallbackApiUrl && fileId) {
        return downloadViaAPI(fallbackApiUrl, fileId, fileName);
      }
      
      toast.error("URL de download não disponível");
      setProgress({ isDownloading: false, error: "URL ausente" });
      return;
    }

    // 2️⃣ Validar formato de URL
    try {
      new URL(fileUrl);
    } catch (e) {
      toast.error("URL de download inválida");
      setProgress({ isDownloading: false, error: "URL inválida" });
      return;
    }

    setProgress({ isDownloading: true, error: null });

    try {
      // 3️⃣ Criar elemento de download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // 4️⃣ Disparar download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 5️⃣ Feedback positivo
      toast.success(`Baixando ${fileName}`);
      setProgress({ isDownloading: false, error: null });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao baixar: ${errorMsg}`);
      setProgress({ isDownloading: false, error: errorMsg });
    }
  }, []);

  const downloadViaAPI = useCallback(async (
    apiUrl: string,
    fileId: number,
    fileName: string
  ) => {
    setProgress({ isDownloading: true, error: null });

    try {
      const response = await fetch(`${apiUrl}/api/files/${fileId}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      setProgress({ isDownloading: false, error: null });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao baixar via API: ${errorMsg}`);
      setProgress({ isDownloading: false, error: errorMsg });
    }
  }, []);

  return {
    ...progress,
    downloadFile,
  };
}
```

---

### PASSO 3: Atualizar document-explorer.tsx

**Arquivo:** `components/document-explorer.tsx`

**Substituir a função `handleDownload`:**

```typescript
import { useFileDownload } from '@/hooks/useFileDownload';

// Dentro do componente:
export default function DocumentExplorer() {
  // ... outro código ...
  
  const { downloadFile, isDownloading } = useFileDownload();

  const handleDownload = useCallback((file: FileItem) => {
    downloadFile(
      file.blob_url,
      file.name,
      API_URL,
      file.id
    );
  }, [downloadFile]);

  // ... resto do componente ...
}
```

---

### PASSO 4: Adicionar Validação na Busca de Arquivos

**Arquivo:** `components/document-explorer.tsx`

**Atualizar SWR para validar dados:**

```typescript
import { FileItemSchema } from '@/lib/schemas';

export default function DocumentExplorer() {
  // ... código ...

  // ✅ ANTES (sem validação):
  // const { data: files = [] } = useSWR(
  //   selectedFolderId ? `${API_URL}/api/files?folder_id=${selectedFolderId}` : null,
  //   fetcher
  // );

  // ✅ DEPOIS (com validação):
  const { data: files = [], error: filesError } = useSWR(
    selectedFolderId ? `${API_URL}/api/files?folder_id=${selectedFolderId}` : null,
    async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Validar cada arquivo
        if (!Array.isArray(data)) {
          throw new Error('Resposta não é um array');
        }
        
        return data.map((file: any) => {
          try {
            return FileItemSchema.parse(file);
          } catch (validationError) {
            console.warn('Arquivo inválido:', file, validationError);
            // Retornar arquivo com blob_url padrão para não quebrar a UI
            return {
              ...file,
              blob_url: file.blob_url || '',
            };
          }
        });
      } catch (error) {
        console.error('Erro ao buscar arquivos:', error);
        toast.error('Erro ao carregar arquivos');
        throw error;
      }
    }
  );

  // Mostrar erro se houver
  if (filesError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Erro ao carregar arquivos</p>
        <p className="text-sm text-muted-foreground">{filesError.message}</p>
      </div>
    );
  }
}
```

---

### PASSO 5: Melhorar file-grid.tsx

**Arquivo:** `components/file-grid.tsx`

**Adicionar indicador visual se blob_url está ausente:**

```typescript
{files.map((file) => (
  <div
    key={file.id}
    className={cn(
      "group relative rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/60 p-6 backdrop-blur-sm",
      "hover:border-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer",
      // ⚠️ Desabilitar se não tiver blob_url
      !file.blob_url && "opacity-60 cursor-not-allowed"
    )}
  >
    {/* ... código anterior ... */}
    
    <div className="flex items-start justify-between mb-4">
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        {getFileIcon(file.mime_type, file.name)}
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          className={cn(
            "p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 transform hover:scale-110",
            !file.blob_url && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          onClick={() => !file.blob_url ? null : onDownload(file)}
          disabled={!file.blob_url}
          aria-label={`Baixar ${file.name}`}
          title={file.blob_url ? "Baixar arquivo" : "URL de download não disponível"}
        >
          <Download className="w-5 h-5 text-primary" />
        </button>
        {/* ... resto dos botões ... */}
      </div>
    </div>

    {/* Mostrar aviso se blob_url ausente */}
    {!file.blob_url && (
      <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-yellow-500 font-semibold">Download indisponível</p>
      </div>
    )}
  </div>
))}
```

---

## 🧪 Teste Prático

### Verificar se Backend Retorna blob_url

```bash
# Terminal: Listar arquivos com blob_url
curl -s https://backend-banco-de-dados-hmfm.vercel.app/api/files | jq '.[0]'

# Resposta esperada:
# {
#   "id": 1,
#   "name": "documento.pdf",
#   "folder_id": 1,
#   "blob_url": "https://storage.example.com/...",  # ✅ DEVE TER ISSO
#   "size": 2048,
#   "mime_type": "application/pdf",
#   "created_at": "2026-04-10T10:00:00Z"
# }
```

---

## 📋 Checklist de Implementação

```
[ ] 1. Criar lib/schemas.ts com validação Zod
[ ] 2. Criar hooks/useFileDownload.ts com lógica segura
[ ] 3. Atualizar components/document-explorer.tsx
[ ] 4. Atualizar components/file-grid.tsx
[ ] 5. Testar com arquivos reais
[ ] 6. Verificar console para erros de validação
[ ] 7. Fazer build e testar em produção
```

---

## ✅ Resultado Esperado

**Antes (com erros):**
- ❌ Clica em "Download" → Nada acontece (silenciosamente falha)
- ❌ Sem mensagem de erro
- ❌ Sem indicativo visual do problema

**Depois (com correções):**
- ✅ Clica em "Download" → Arquivo é baixado com sucesso
- ✅ Se falhar, mensagem de erro clara: "URL de download inválida" ou "Erro ao baixar"
- ✅ Botão de download desabilitado se blob_url não disponível
- ✅ Console mostra detalhes do erro para debug

---

## 🔗 Referências

- [Zod Documentation](https://zod.dev)
- [MDN: File Download API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

*Guia prático para implementação de downloads seguros - HMFM Frontend*
