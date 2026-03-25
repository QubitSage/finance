# Casal App

App completo do casal — finanças, viagens, desejos, regras, mercado, apartamento, casamento, metas e compromissos.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend / Auth / DB**: Supabase (gratuito)
- **Hospedagem**: GitHub Pages, Render, Railway ou qualquer static host

---

## Configuração passo a passo

### 1. Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** e cole todo o bloco SQL que está dentro de `src/lib/supabase.js`
3. Execute — isso cria as 20 tabelas e configura a segurança (RLS)
4. Vá em **Settings → API** e copie:
   - **Project URL**
   - **anon public key**

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:
```
VITE_SUPABASE_URL=https://xyzxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Instalar e rodar local

```bash
npm install
npm run dev
# Abra http://localhost:5173
```

### 4. Build para produção

```bash
npm run build
# Pasta dist/ está pronta para deploy
```

---

## Deploy no GitHub Pages

```bash
# 1. Instale o plugin
npm install -D gh-pages

# 2. Adicione ao package.json → scripts:
"deploy": "gh-pages -d dist"

# 3. Adicione ao vite.config.js:
# base: '/nome-do-repositorio/'

# 4. Build e deploy
npm run build
npm run deploy
```

Adicione as variáveis de ambiente no repositório em **Settings → Secrets → Actions**.

---

## Deploy no Render (recomendado — mais simples)

1. Crie conta em [render.com](https://render.com)
2. New → Static Site → conecte seu repositório GitHub
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Adicione as variáveis de ambiente no painel do Render
6. Deploy automático a cada push no GitHub

---

## Estrutura do projeto

```
src/
├── components/
│   ├── Layout.jsx        # Sidebar + bottom nav mobile
│   ├── PageHeader.jsx    # Cabeçalho padrão
│   └── Modal.jsx         # Modal reutilizável
├── contexts/
│   └── AuthContext.jsx   # Login/logout/sessão
├── hooks/
│   ├── useDB.js          # CRUD genérico Supabase
│   └── useSettings.js    # Configurações do casal
├── lib/
│   ├── supabase.js       # Cliente + SQL schema completo
│   └── utils.js          # Helpers, constantes, formatação
├── pages/
│   ├── LoginPage.jsx     # Login e cadastro
│   ├── Dashboard.jsx     # Resumo financeiro
│   ├── Transactions.jsx  # Entradas e saídas
│   └── AllPages.jsx      # Todas as demais páginas
└── styles/
    └── global.css        # Design system completo
```

---

## Páginas disponíveis

| Rota | Página |
|------|--------|
| `/` | Dashboard financeiro |
| `/transacoes` | Entradas e saídas |
| `/esposa` | Mimos da esposa |
| `/poupanca` | Poupança e metas |
| `/relatorios` | Gráficos 6 meses |
| `/regras` | Regras do casal |
| `/viagens` | Organização de viagens |
| `/desejos` | Desejos / Mimos / Planner |
| `/questionario` | Perguntas e respostas |
| `/dados` | Perfil do casal |
| `/mercado` | Lista de mercado |
| `/apartamento` | Itens do apartamento |
| `/casamento` | Organização do casamento |
| `/metas` | Metas pessoais |
| `/compromissos` | Calendário semanal |
| `/pendencias` | Pendências (em branco) |
| `/config` | Configurações |

---

## Mobile

O app é responsivo. Para instalar como PWA no celular:
- **iPhone**: Safari → Compartilhar → "Adicionar à Tela de Início"
- **Android**: Chrome → Menu (⋮) → "Adicionar à tela inicial"
