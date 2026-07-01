# Vida Livre

App do casal — agenda, mimos, marcos, regras e planejamento. **Site web** com sync na nuvem (Supabase): Bruno e Vianka usam cada um no seu navegador, em qualquer lugar.

## Desenvolvimento

```bash
cd vida-livre
cp .env.example .env.local   # preencha com Supabase
npm install
npm run dev
```

Sem `.env.local`, o app roda só no navegador local (sem sync).

## Supabase (obrigatório para sync entre dispositivos)

1. Projeto no [Supabase](https://supabase.com) (pode reutilizar o do CasalApp antigo)
2. **SQL Editor** → cole e execute `supabase/schema.sql`
3. **Authentication → Users** → crie um usuário do casal (ex.: `casal@casal.app` + senha forte)
4. **Database → Replication** → confirme que `vl_couple_state` está na publicação realtime
5. Copie **Project URL** e **anon key** para as variáveis abaixo

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto |
| `VITE_SUPABASE_ANON_KEY` | Chave anon (pública) |
| `VITE_COUPLE_EMAIL` | E-mail do usuário compartilhado do casal |
| `VITE_COUPLE_PASSWORD` | Senha desse usuário |

No **Vercel** (project-rz2rl): Settings → Environment Variables → adicione as 4 para Production.

## Deploy web

Site: **https://project-rz2rl.vercel.app**

Root Directory no Vercel: `vida-livre`. Node **20.x**.

## Login

Código pessoal de 6 dígitos (não vai para a nuvem — fica só no aparelho):

| Pessoa | Código |
|--------|--------|
| Vianka | `220696` |
| Bruno | `160497` |

Os **dados do casal** (agenda, mimos, marcos, regras…) sincronizam via Supabase. Cada um entra com seu código e vê o seu lado.

## Android (opcional)

APK via GitHub Actions — ver workflow em `.github/workflows/build-android.yml`.
