# Vida Livre

App do casal — agenda, mimos, marcos, regras e planejamento. Dados locais no celular (`localStorage`).

## Desenvolvimento

```bash
cd vida-livre
npm install
npm run dev
```

## Deploy

### Android (APK automático)

Cada push na `main` que altera `vida-livre/` gera um APK na release **[apk-latest](https://github.com/QubitSage/finance/releases/tag/apk-latest)**.

No celular: baixar `vida-livre.apk` → instalar (substitui o CasalApp antigo, mesmo `com.casalapp.app`).

### Web (Vercel)

O `vercel.json` na raiz do repositório aponta o deploy para `vida-livre/`. Faça redeploy no painel Vercel após o push.

Se o build falhar, confira em **Settings → General → Node.js Version** que está em **20.x**.

### GitHub Actions (APK)

Se o workflow falhar em poucos segundos **sem rodar nenhum step**, o problema é na conta GitHub (Actions desabilitado ou limite de minutos). Abra [Actions](https://github.com/QubitSage/finance/actions) e veja a mensagem vermelha no topo do job.

Depois de corrigir: **Actions → Build Android APK → Run workflow** (manual).

### Build local Android

```bash
npm run cap:sync
npm run cap:open
```

## Logins

- **Vianka** e **Bruno** — escolha na tela inicial. Dados separados por sessão; acordos do casal são compartilhados.
