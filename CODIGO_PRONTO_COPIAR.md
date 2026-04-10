# 💻 CÓDIGO PRONTO PARA USAR - Correções de Download

**Copie e cole o código abaixo nos arquivos indicados**

---

## 📝 ARQUIVO 1: Criar `lib/schemas.ts`

**Novo arquivo:** `lib/schemas.ts`

```typescript
import { z } from 'zod';

/**
 * Schema para validar arquivo (FileItem)
 * Zod vai validar em runtime que os dados do backend são válidos
 */
export const FileItemSchema = z.object({
  id: z.number().int().positive("ID deve ser um número positivo"),
  name: z.string().min(1, "Nome do arquivo é obrigatório"),
  folder_id: z.number().int().nonnegative("Folder ID deve ser >= 0"),
  blob_url: z.string().url("blob_url deve ser uma URL válida"),
  size: z.number().int().nonnegative("Tamanho deve ser >= 0"),
  mime_type: z.string().min(1, "MIME type é obrigatório"),
  created_at: z.string(),
});

export type FileItem = z.infer<typeof FileItemSchema>;

/**
 * Schema para validar pasta (FolderItem)
 */
export const FolderItemSchema = z.object({
  id: z.number().int().positive("ID deve ser um número positivo"),
  name: z.string().min(1, "Nome da pasta é obrigatório"),
  parent_id: z.number().int().nonnegative("Parent ID deve ser >= 0").nullable(),
  created_at: z.string().optional(),
});

export type FolderItem = z.infer<typeof FolderItemSchema>;
```

**Status:** ✅ Criar novo arquivo

---

## 📝 ARQUIVO 2: Criar `hooks/useFileDownload.ts`

**Novo arquivo:** `hooks/useFileDownload.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para download seguro de arquivos
 * 
 * Características:
 * ✅ Validação de URL
 * ✅ Try/catch para erros
 * ✅ Fallback via API
 * ✅ Feedback ao usuário
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

      const errorMsg = "URL de download não disponível";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // ❌ Verificar se é URL válida
    try {
      new URL(fileUrl);
    } catch (e) {
      const errorMsg = "URL de download inválida";
      toast.error(errorMsg);
      setError(errorMsg);
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

      toast.success(`Arquivo ${fileName} baixado`);
      setError(null);
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
```

**Status:** ✅ Criar novo arquivo

---

## 📝 ARQUIVO 3: Atualizar `components/document-explorer.tsx`

**Mudança 1:** Adicionar import no topo do arquivo

```typescript
// Adicionar esta linha com os outros imports
import { useFileDownload } from '@/hooks/useFileDownload';
```

**Mudança 2:** Dentro do componente, adicionar o hook

```typescript
export default function DocumentExplorer() {
  // ... outros useState ...
  
  // ✅ ADICIONAR ESTA LINHA
  const { downloadFile, isDownloading: isFileDownloading } = useFileDownload();

  // ... resto do código ...
}
```

**Mudança 3:** Substituir a função `handleDownload`

```typescript
// ❌ REMOVER ESTA FUNÇÃO:
// const handleDownload = (file: FileItem) => {
//   const a = document.createElement("a");
//   a.href = file.blob_url;
//   a.download = file.name;
//   a.target = "_blank";
//   a.rel = "noopener noreferrer";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   toast.success(`Baixando ${file.name}`);
// };

// ✅ ADICIONAR ESTA FUNÇÃO:
const handleDownload = useCallback((file: FileItem) => {
  downloadFile(
    file.blob_url,
    file.name,
    {
      fallbackApiUrl: API_URL,
      fileId: file.id,
    }
  );
}, [downloadFile]);
```

---

## 📝 ARQUIVO 4: Atualizar `components/file-grid.tsx`

**Mudança:** Melhorar botão de download (linha ~223)

```typescript
// ❌ ANTES:
{/* <button
  className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 transform hover:scale-110"
  onClick={() => onDownload(file)}
  aria-label={`Baixar ${file.name}`}
  title="Baixar arquivo"
>
  <Download className="w-5 h-5 text-primary" />
</button> */}

// ✅ DEPOIS:
<button
  className={cn(
    "p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 transform hover:scale-110",
    !file.blob_url && "opacity-50 cursor-not-allowed hover:bg-transparent"
  )}
  onClick={() => file.blob_url && onDownload(file)}
  disabled={!file.blob_url}
  aria-label={`Baixar ${file.name}`}
  title={file.blob_url ? "Baixar arquivo" : "URL de download não disponível"}
>
  <Download className="w-5 h-5 text-primary" />
</button>
```

---

## 🧪 TESTE O CÓDIGO

### Passo 1: Verificar se Backend Retorna blob_url

```bash
# Execute no terminal
curl -s https://backend-banco-de-dados-hmfm.vercel.app/api/files | jq '.[0]'

# Deve retornar algo como:
# {
#   "id": 1,
#   "name": "documento.pdf",
#   "folder_id": 1,
#   "blob_url": "https://...",  ← ✅ DEVE ESTAR AQUI
#   "size": 1024,
#   "mime_type": "application/pdf",
#   "created_at": "2026-04-10T10:00:00Z"
# }
```

### Passo 2: Testar Download

1. Instalar dependências (se ainda não fez)
   ```bash
   npm install
   ```

2. Iniciar frontend
   ```bash
   npm run dev
   ```

3. Abrir http://localhost:3000

4. Selecionar uma pasta

5. Clicar em download

6. Verificar:
   - ✅ Arquivo é baixado, OU
   - ✅ Mensagem de erro clara aparece

7. Abrir DevTools (F12) e verificar console:
   - ✅ Se tudo OK, sem erros
   - ⚠️ Se tiver erro, mensagem vai aparecer

---

## 🔍 CHECKLIST DE IMPLEMENTAÇÃO

```
[ ] 1. Criar lib/schemas.ts
[ ] 2. Criar hooks/useFileDownload.ts
[ ] 3. Adicionar import em document-explorer.tsx
[ ] 4. Adicionar useFileDownload hook em document-explorer.tsx
[ ] 5. Substituir função handleDownload
[ ] 6. Atualizar botão de download em file-grid.tsx
[ ] 7. npm install (se precisar de pacotes novos)
[ ] 8. npm run dev
[ ] 9. Testar download
[ ] 10. Verificar console para erros
[ ] 11. npm run build (build para produção)
[ ] 12. npm start (testar em produção local)
```

---

## ✅ RESULTADO ESPERADO

### Cenário 1: Arquivo com blob_url válida

```
Usuário clica em "Download"
↓
✅ Arquivo é baixado com sucesso
↓
Toast: "Arquivo documento.pdf sendo baixado..."
```

### Cenário 2: Arquivo sem blob_url

```
Usuário clica em "Download"
↓
❌ Botão desabilitado e opaco
↓
Toast: "URL de download não disponível"
```

### Cenário 3: Arquivo com blob_url inválida

```
Usuário clica em "Download"
↓
❌ Tenta baixar mas falha
↓
Toast: "Erro ao baixar: URL de download inválida"
↓
Console: Mensagem detalhada de erro
```

---

## 📞 TROUBLESHOOTING

### Erro: "Arquivo xxx não encontrado"

```
Causa: Arquivo não existe mais no backend
Solução: Recarregar página (F5)
```

### Erro: "CORS blocked"

```
Causa: Backend não tem CORS configurado
Solução: Verificar configuração do backend
```

### Erro: "blob_url é undefined"

```
Causa: Backend não retorna blob_url
Solução: Avisar ao time do backend para incluir blob_url na resposta
```

### Erro: Botão de download não aparece

```
Causa: file.blob_url está undefined
Solução: Mesma acima - avisar backend
```

---

## 📚 REFERÊNCIAS

- Arquivo de análise completa: `ANALISE_PROJETO_E_ERROS.md`
- Guia detalhado: `GUIA_CORRECAO_DOWNLOADS.md`
- Resumo em português: `RESUMO_ERROS_PT.md`

---

*Código pronto para copiar e colar*
*HMFM Frontend - 10 de Abril de 2026*
