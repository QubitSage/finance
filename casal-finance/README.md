# 💑 Casal Finance

App de finanças do casal com dashboard, controle de entradas/saídas, mimos da esposa, metas de poupança e relatórios mensais.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend / DB**: Supabase (auth + banco de dados)
- **Hospedagem**: Vercel (gratuita)

---

## 🚀 Como colocar no ar (passo a passo)

### 1. Criar conta no Supabase (gratuito)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto (guarde a senha do banco)
3. Vá em **SQL Editor** e cole todo o conteúdo do bloco SQL que está dentro do arquivo `src/lib/supabase.js`
4. Execute o SQL — isso cria as tabelas e configura a segurança

### 2. Pegar as credenciais do Supabase

No painel do Supabase:
- Vá em **Settings → API**
- Copie a **Project URL** e a **anon public key**

### 3. Configurar o projeto

```bash
# Clonar / extrair o projeto
cd casal-finance

# Instalar dependências
npm install

# Criar o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` e coloque suas credenciais:
```
VITE_SUPABASE_URL=https://xyzxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Testar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173` — crie uma conta e comece a usar!

### 5. Publicar na Vercel (gratuito)

1. Crie conta em [vercel.com](https://vercel.com)
2. Instale a CLI: `npm i -g vercel`
3. No terminal, dentro da pasta do projeto: `vercel`
4. Siga as instruções (framework = Vite, pasta = casal-finance)
5. Nas configurações do projeto na Vercel, vá em **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Redeploy — seu app estará online!

---

## 📱 Funciona no celular?

Sim! O layout é responsivo. Para instalar como app no celular:
- No iPhone: Safari → Compartilhar → "Adicionar à Tela de Início"
- No Android: Chrome → Menu → "Adicionar à tela inicial"

---

## 🗂 Estrutura do projeto

```
src/
├── components/
│   └── Layout.jsx          # Sidebar + navegação
├── hooks/
│   ├── useAuth.jsx          # Autenticação
│   ├── useTransactions.js   # CRUD de transações
│   ├── useSettings.js       # Configurações do casal
│   └── useSavingsGoals.js   # Metas de poupança
├── lib/
│   ├── supabase.js          # Cliente + SQL schema
│   └── utils.js             # Formatação e constantes
├── pages/
│   ├── AuthPage.jsx         # Login / Cadastro
│   ├── Dashboard.jsx        # Resumo geral
│   ├── Transactions.jsx     # Entradas e saídas
│   ├── WifePage.jsx         # Mimos da esposa
│   ├── SavingsPage.jsx      # Poupança e metas
│   ├── ReportsPage.jsx      # Gráficos e relatórios
│   └── SettingsPage.jsx     # Configurações
└── styles/
    └── global.css           # Tailwind + classes base
```

---

## ✨ Funcionalidades

- ✅ Login e cadastro com e-mail/senha
- ✅ Dashboard com resumo do mês
- ✅ Entradas e saídas por categoria
- ✅ Cálculo automático da % da esposa
- ✅ Controle de mimos com saldo disponível
- ✅ Metas de poupança com barra de progresso
- ✅ Relatórios dos últimos 6 meses com gráficos
- ✅ Configurações do casal (nome e %)
- ✅ Funciona no celular (PWA-ready)
- ✅ Dados separados por mês
