# Text Processing API with Crypto Payments

A monetizable AI text processing API that accepts USDT (TRC20) cryptocurrency payments.

## Features

- **Text Processing API** - Paraphrase, summarize, grammar check, expand, and simplify text
- **Crypto Payments** - Accept USDT (TRC20) for API credits
- **API Key Management** - Instant key generation after payment
- **Live Testing** - Test the API directly from the web interface

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **Backend**: Next.js Route Handlers
- **Deployment**: GitHub + Vercel

## API Endpoints

### `POST /api/payment/create`
Create a new payment request.

```bash
curl -X POST https://your-domain.com/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"plan": "starter"}'
```

### `GET /api/payment/verify?paymentId=xxx`
Verify payment and get API key.

### `POST /api/process/text`
Process text with AI models.

```bash
curl -X POST https://your-domain.com/api/process/text \
  -H "Content-Type: application/json" \
  -H "x-api-key: aitx_your_key_here" \
  -d '{"text": "Your text here", "mode": "paraphrase"}'
```

Modes: `paraphrase`, `summarize`, `grammar`, `expand`, `simplify`

### `GET /api/key/verify?key=xxx`
Verify API key and check remaining credits.

## Pricing

| Plan | Price | Credits |
|------|-------|---------|
| Starter | $5 USDT | 1,000 calls |
| Pro | $20 USDT | 10,000 calls |
| Enterprise | $100 USDT | 100,000 calls |

## Getting Started

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Set your TRON wallet address:
```
MY_TRON_ADDRESS=YOUR_TRON_WALLET_ADDRESS
TRONGRID_API_KEY=YOUR_TRONGRID_API_KEY
```

3. Run the development server:
```bash
npm install
npm run dev
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

## Production TODO

- [ ] Integrate real AI API (OpenAI, Anthropic, etc.)
- [ ] Add blockchain payment verification (TronGrid API)
- [ ] Add database (PostgreSQL, Redis)
- [ ] Add rate limiting
- [ ] Add webhook for payment confirmations
