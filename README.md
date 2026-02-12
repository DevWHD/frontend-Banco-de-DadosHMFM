# Frontend - Hospital Document Explorer

Interface web do sistema de gerenciamento de documentos hospitalares.

## 🚀 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo:
```bash
copy .env.example .env.local
```

2. Configure a variável de ambiente no arquivo `.env.local`:
   - `NEXT_PUBLIC_API_URL`: URL da API backend (padrão: http://localhost:3001)

**Importante**: A variável deve começar com `NEXT_PUBLIC_` para ser acessível no browser.

## 🏃 Executando

### Desenvolvimento
```bash
npm run dev
```

O frontend estará disponível em: http://localhost:3000

### Produção
```bash
npm run build
npm start
```

## 🔗 Dependências

- **Backend**: Certifique-se de que a API backend está rodando antes de iniciar o frontend
- **API URL**: Configure `NEXT_PUBLIC_API_URL` para apontar para sua API

## 📦 Tecnologias

- **Framework**: Next.js 16 (React 19)
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: SWR (React Hooks for Data Fetching)
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React
- **Themes**: next-themes (suporte a dark mode)

## 🌐 Deploy

### Vercel
```bash
vercel
```

### Netlify
```bash
netlify deploy
```

### Outras plataformas
1. Configure a variável `NEXT_PUBLIC_API_URL` com a URL do backend em produção
2. Execute `npm run build`
3. Faça deploy da pasta `.next` ou execute `npm start`

## 📁 Estrutura

```
frontend/
├── app/              # Páginas Next.js (App Router)
├── components/       # Componentes React
│   ├── ui/          # Componentes UI (shadcn/ui)
│   └── ...          # Componentes da aplicação
├── hooks/           # React Hooks personalizados
├── lib/             # Utilitários e configurações
└── public/          # Assets estáticos
```

## 🔧 Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Inicia servidor em produção
- `npm run lint` - Verifica código com ESLint
