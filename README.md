# Dawid Faith Webhook API

Eine Webhook-API für automatisierte D.FAITH Token-Käufe über ParaSwap auf der Base Chain.

## 🚀 Features

- ✅ Automatische ETH zu D.FAITH Swaps via ParaSwap
- ✅ Base Chain (8453) Unterstützung
- ✅ Konfigurierbare Slippage (Standard: 1%)
- ✅ Balance-Validierung
- ✅ Umfassende Fehlerbehandlung
- ✅ Transaktionsbestätigung
- ✅ Vercel Deployment bereit

## 📡 API Endpoints

### POST /api/swap
Führt einen ETH zu D.FAITH Swap über ParaSwap aus.

**Request Body:**
```json
{
  "ethAmount": "0.1",
  "slippage": 100,
  "recipientAddress": "0x..." // optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "dfaithReceived": "123.45",
  "ethSpent": "0.1",
  "gasUsed": "150000"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Insufficient ETH balance"
}
```

### GET /api/health
Überprüft den API-Status und die Wallet-Balance.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-04T12:00:00.000Z",
  "wallet": {
    "address": "0x...",
    "ethBalance": "1.234"
  },
  "config": {
    "dfaithToken": "0x69eFD833288605f320d77eB2aB99DDE62919BbC1",
    "baseChainId": 8453,
    "minEthAmount": "0.0001"
  }
}
```

## ⚙️ Setup & Deployment

### 1. Environment Variables
Erstelle eine `.env.local` Datei mit folgenden Variablen:

```env
PRIVATE_KEY=dein_wallet_private_key_hier
BASE_RPC_URL=https://mainnet.base.org
DFAITH_TOKEN_ADDRESS=0x69eFD833288605f320d77eB2aB99DDE62919BbC1
```

### 2. Installation
```bash
npm install
```

### 3. Development
```bash
npm run dev
```

### 4. Vercel Deployment

1. Pushe den Code zu GitHub
2. Verbinde das Repository mit Vercel
3. Setze die Environment Variables in den Vercel-Einstellungen
4. Deploy!

**Wichtig:** Stelle sicher, dass dein Wallet ausreichend ETH für Gas-Gebühren und Swaps hat.

## 🔧 Konfiguration

### Token Details
- **D.FAITH Token:** `0x69eFD833288605f320d77eB2aB99DDE62919BbC1`
- **Decimals:** 2
- **Network:** Base Chain (8453)

### ParaSwap Settings
- **API:** ParaSwap v5 API
- **Min. ETH Amount:** 0.0001 ETH
- **Default Slippage:** 1% (100 basis points)
- **Max Price Impact:** 50%

## 📝 Verwendung

### Beispiel: Swap ausführen
```bash
curl -X POST https://your-vercel-app.vercel.app/api/swap \
  -H "Content-Type: application/json" \
  -d '{
    "ethAmount": "0.05",
    "slippage": 150
  }'
```

### Beispiel: Status prüfen
```bash
curl https://your-vercel-app.vercel.app/api/health
```

## ⚠️ Sicherheitshinweise

- **Private Key:** Niemals den Private Key in den Code oder öffentliche Repositories committen
- **Environment Variables:** Verwende sichere Environment Variables in Vercel
- **Rate Limiting:** Implementiere Rate Limiting für Produktionsumgebungen
- **Monitoring:** Überwache Transaktionen und Wallet-Balance regelmäßig

## 🛠️ Fehlerbehandlung

Die API behandelt verschiedene Fehlertypen:

- **Unzureichende Liquidität:** Versuche einen größeren Betrag (min. 0.001 ETH)
- **Hoher Price Impact:** Versuche einen kleineren Betrag
- **Unzureichende Balance:** Lade dein Wallet mit mehr ETH auf
- **ParaSwap API Fehler:** Versuche es später erneut

## 📊 Monitoring

Überwache deine Webhook-API mit:
- Vercel Analytics
- Wallet-Balance über `/api/health`
- Transaction-Logs in Vercel Functions

## 🤝 Support

Bei Problemen oder Fragen zur Integration, überprüfe:
1. Environment Variables sind korrekt gesetzt
2. Wallet hat ausreichend ETH-Balance
3. ParaSwap API ist verfügbar
4. Base Chain RPC funktioniert