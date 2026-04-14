# Como Gerar o APK Android - Casal App

O projeto usa **Capacitor** para gerar um APK nativo Android a partir do app React/Vite.

## Pre-requisitos

- Node.js 18+ instalado
- Android Studio instalado (com SDK Android e emulador configurado)
- JDK 17 instalado

## Passos para Gerar o APK

### 1. Clone e instale as dependencias

```bash
git clone https://github.com/QubitSage/finance.git
cd finance/casalapp/casalapp
npm install
```

### 2. Compile o app web

```bash
npm run build
```

### 3. Adicione a plataforma Android (primeira vez apenas)

```bash
npx cap add android
```

### 4. Sincronize o build com o Android

```bash
npx cap sync android
```

### 5. Gere o APK de debug

```bash
cd android
./gradlew assembleDebug
```

O APK sera gerado em:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Instalar no Celular

1. Copie o arquivo `app-debug.apk` para o celular
2. No Android: Configuracoes > Seguranca > Fontes desconhecidas (habilitar)
3. Abra o arquivo APK no celular para instalar

## Abrir no Android Studio

```bash
npx cap open android
```

## Notificacoes Nativas

O app usa **@capacitor/local-notifications** para alertas nativos.
- Permissao solicitada automaticamente na primeira vez
- Alertas disparam **30 minutos antes** do horario da tarefa
- Funciona mesmo com o app em background

## Atualizacoes Futuras

Apos alterar o codigo, repita:
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Automatico via GitHub Actions

O workflow `.github/workflows/build-android.yml` esta configurado para gerar o APK
automaticamente. Necessita de conta GitHub com Actions habilitado.
