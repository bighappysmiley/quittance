# Quittance

Private IOU tracker for money and items. Accounts auth via **Neon Auth**; ledger data lives in **Neon Postgres**.

## Live

https://quittanceledger.netlify.app

## Stack

- Next.js App Router
- Neon Auth (email/password)
- Neon Postgres (`people`, `entries`, `preferences`)
- Netlify deploy from `main`

## Develop

```bash
cp .env.example .env.local
# fill DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET
npm install
npm run dev
```

Create an account, then optionally **Load fictional sample** in Settings (Alex / Jordan / Riley / Morgan — not real people).
