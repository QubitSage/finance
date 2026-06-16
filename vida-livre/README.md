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

No painel Vercel, aponte o **Root Directory** para `vida-livre` e faça deploy. O `vercel.json` já trata rotas SPA.

### Build local Android

```bash
npm run cap:sync
npm run cap:open
```

## Logins

- **Vianka** e **Bruno** — escolha na tela inicial. Dados separados por sessão; acordos do casal são compartilhados.
