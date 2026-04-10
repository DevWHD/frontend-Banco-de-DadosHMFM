# 📋 Análise Completa do Projeto Frontend - HMFM

**Data:** 10 de Abril de 2026  
**Status:** ✅ Projeto Funcional (com observações importantes)

---

## 📊 Resumo Executivo

O projeto é um **frontend React/Next.js** para um sistema de gerenciamento de documentos hospitalares. A arquitetura está bem estruturada, não há erros de sintaxe críticos, mas **existem algumas vulnerabilidades e pontos a otimizar relacionados ao download de arquivos**.

### ✅ Status Geral: **FUNCIONANDO**
### ⚠️ Pontos Críticos Identificados: **3**

---

## 🏗️ Estrutura do Projeto

```
Frontend: Hospital Document Explorer (HMFM)
├── Tecnologia: Next.js 16 (React 19)
├── UI Framework: Radix UI + Tailwind CSS
├── State Management: SWR (React Hooks for Data Fetching)
├── Autenticação: Proteção por senha (client-side)
├── Backend: https://backend-banco-de-dados-hmfm.vercel.app
├── Desenvolvimento: npm run dev → http://localhost:3000
└── Produção: npm run build && npm start
```

### 📁 Principais Componentes

| Componente | Função | Status |
|---|---|---|
| `document-explorer.tsx` | Componente principal | ✅ OK |
| `file-grid.tsx` | Grid de exibição de arquivos | ✅ OK |
| `folder-tree.tsx` | Árvore de pastas (sidebar) | ✅ OK |
| `password-dialog.tsx` | Diálogo de autenticação | ✅ OK |

---

## 🔴 PROBLEMAS IDENTIFICADOS NO DOWNLOAD DE ARQUIVOS

### ❌ **PROBLEMA #1: Dependência de `blob_url` do Backend (CRÍTICO)**

**Localização:** [components/document-explorer.tsx](components/document-explorer.tsx#L317-L325)

```typescript
const handleDownload = (file: FileItem) => {
  const a = document.createElement("a");
  a.href = file.blob_url;  // ⚠️ DEPENDE DO BACKEND FORNECER blob_url
  a.download = file.name;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast.success(`Baixando ${file.name}`);
};
```

**O Problema:**
- ✅ O frontend **assume** que o backend retorna um campo `blob_url` em cada arquivo
- ❌ **NÃO há validação** se o `blob_url` existe antes de usar
- ❌ **SEM tratamento de erro** se o blob_url for `null`, `undefined` ou inválido
- ❌ **SEM suporte alternativo** se o backend não conseguir gerar a URL

**Impacto:**
- Se o backend não fornecer `blob_url`, o link será `"undefined"` e o download falhará silenciosamente
- O usuário verá "Baixando arquivo.pdf" mas nada será baixado
- Sem nenhuma mensagem de erro para diagnosticar o problema

**Solução Recomendada:**
```typescript
const handleDownload = async (file: FileItem) => {
  // 1. Validar se blob_url existe
  if (!file.blob_url) {
    toast.error("URL de download não disponível para este arquivo");
    console.error('blob_url ausente para arquivo:', file);
    return;
  }

  try {
    // 2. Validar se é uma URL válida
    new URL(file.blob_url);
    
    // 3. Tentar baixar
    const a = document.createElement("a");
    a.href = file.blob_url;
    a.download = file.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Baixando ${file.name}`);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      toast.error("URL de download inválida");
    } else {
      toast.error("Erro ao baixar arquivo");
    }
    console.error('Erro no download:', error);
  }
};
```

---

### ❌ **PROBLEMA #2: Falta de Validação do Tipo `FileItem`**

**Localização:** [components/file-grid.tsx](components/file-grid.tsx#L20-L22)

```typescript
export type FileItem = {
  id: number;
  name: string;
  folder_id: number;
  blob_url: string;  // ⚠️ Não é opcional, mas nada garante que virá do backend
  size: number;
  mime_type: string;
  created_at: string;
};
```

**O Problema:**
- ✅ O tipo TypeScript define `blob_url` como `string` obrigatório
- ❌ Nenhuma validação em runtime se o backend realmente retorna isso
- ❌ Se o backend enviar `null` ou `undefined`, TypeScript não vai reclamar em produção (JS puro)

**Impacto:**
- Em desenvolvimento, o TypeScript avisa. Em produção (build), isso é ignorado
- Se o backend mudar a estrutura, o frontend continua tentando usar `blob_url` inexistente

**Solução:**
```typescript
// Usar Zod para validação em runtime
import { z } from 'zod';

export const FileItemSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome do arquivo é obrigatório"),
  folder_id: z.number(),
  blob_url: z.string().url("blob_url deve ser uma URL válida"), // ✅ Valida URL
  size: z.number().min(0),
  mime_type: z.string(),
  created_at: z.string().datetime(),
});

export type FileItem = z.infer<typeof FileItemSchema>;

// No componente, validar a resposta:
const { data: files = [] } = useSWR(
  selectedFolderId ? `${API_URL}/api/files?folder_id=${selectedFolderId}` : null,
  async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data.map((file: any) => FileItemSchema.parse(file)); // ✅ Valida
  }
);
```

---

### ❌ **PROBLEMA #3: Sem Suporte para Download Direto via API**

**O Problema:**
- ✅ O frontend usa `blob_url` do backend
- ❌ **NÃO há endpoint de download direto** como `/api/files/{id}/download`
- ❌ Se o backend não suportar blob URLs, não há fallback

**Impacto:**
- Se o backend armazena arquivos em storage externo (S3, Azure Blob, etc), a URL pode expirar
- Sem um endpoint de download centralizado, o frontend fica refém do backend fornecer URLs válidas

**Solução Alternativa:**
```typescript
const handleDownload = async (file: FileItem) => {
  if (!file.blob_url) {
    toast.error("Tentando download via API...");
    // Fallback: tentar baixar via endpoint
    try {
      const response = await fetch(`${API_URL}/api/files/${file.id}/download`, {
        method: 'GET',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Arquivo ${file.name} baixado`);
    } catch (error) {
      toast.error("Erro ao baixar arquivo");
    }
    return;
  }

  // ... continuar com blob_url ...
};
```

---

## 🟡 OBSERVAÇÕES IMPORTANTES

### 1. **Verificação do Backend**

O arquivo `BACKEND_CONNECTION_STATUS.md` confirma:
- ✅ Backend está **online** (https://backend-banco-de-dados-hmfm.vercel.app)
- ✅ Endpoints `/api/folders` e `/api/files` estão **funcionando**
- ✅ CORS está **configurado** corretamente
- ⚠️ **Confirmação**: É crítico verificar se o backend **retorna `blob_url`** em `/api/files`

### 2. **Variáveis de Ambiente**

**Arquivo:** `.env`
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

⚠️ **PROBLEMA:** Está configurado para `localhost:3001` (desenvolvimento local)

**Para Produção, alterar para:**
```dotenv
NEXT_PUBLIC_API_URL=https://backend-banco-de-dados-hmfm.vercel.app
```

O arquivo `lib/config.ts` tem fallback:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-banco-de-dados-hmfm.vercel.app';
```

✅ Isso é **bom**, fornece fallback automático.

---

## ✅ O QUE ESTÁ FUNCIONANDO

| Funcionalidade | Status | Notas |
|---|---|---|
| **Listagem de Pastas** | ✅ OK | Carrega do `/api/folders` |
| **Criação de Pastas** | ✅ OK | Com proteção por senha (6 dígitos) |
| **Listagem de Arquivos** | ✅ OK | Carrega do `/api/files` |
| **Upload de Arquivos** | ✅ OK | POST para `/api/upload` |
| **Exclusão de Arquivos** | ✅ OK | DELETE `/api/files/{id}` |
| **Exclusão de Pastas** | ✅ OK | DELETE `/api/folders/{id}` |
| **UI/UX** | ✅ OK | Componentes Radix UI bem implementados |
| **Autenticação** | ✅ OK | Proteção por senha no cliente (client-side) |
| **Temas** | ✅ OK | Dark/Light mode com `next-themes` |
| **Download** | ⚠️ PARCIAL | Depende do `blob_url` do backend |

---

## 🔧 CHECKLIST DE CORREÇÃO

Para garantir que **o download de arquivos funcione sem problemas**, execute:

### [ ] 1. Verificar Backend

```bash
# Teste via curl
curl https://backend-banco-de-dados-hmfm.vercel.app/api/files
# Verificar se a resposta inclui "blob_url" para cada arquivo
```

### [ ] 2. Implementar Validação

Adicionar validação Zod conforme sugerido em **PROBLEMA #2**.

### [ ] 3. Melhorar Tratamento de Erro

Implementar try-catch no `handleDownload` conforme sugerido em **PROBLEMA #1**.

### [ ] 4. Adicionar Fallback

Implementar endpoint alternativo `/api/files/{id}/download` conforme sugerido em **PROBLEMA #3**.

### [ ] 5. Testar Cenários

```javascript
// Cenário 1: blob_url válido
{ id: 1, name: "documento.pdf", blob_url: "https://..." }

// Cenário 2: blob_url ausente
{ id: 2, name: "documento.pdf" } // ❌ Vai quebrar

// Cenário 3: blob_url inválido
{ id: 3, name: "documento.pdf", blob_url: "not-a-url" }
```

---

## 📝 RESUMO

### ✅ **Projeto está 90% pronto para produção**

**Funcionalidades implementadas:**
- ✅ Sistema completo de pastas (CRUD)
- ✅ Sistema de autenticação por senha
- ✅ Upload de arquivos
- ✅ UI profissional e responsiva

**Pontos a corrigir antes do deploy:**
1. ⚠️ Validação do `blob_url` no download
2. ⚠️ Tratamento de erros no download
3. ⚠️ Fallback alternativo para download
4. ⚠️ Confirmar que backend retorna `blob_url`

**Recomendações:**
- 🔧 Implementar as correções sugeridas
- 🧪 Testar download com arquivos reais
- 📊 Adicionar logging de erros no cliente
- 🔐 Considerar autenticação mais robusta que senha de 6 dígitos

---

## 🚀 Para Começar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev
# Acessar em http://localhost:3000

# Build para produção
npm run build

# Iniciar produção
npm start
```

**Certifique-se de que o backend está rodando e o `.env` está configurado corretamente!**

---

*Documento gerado automaticamente - Análise completa do projeto HMFM*
