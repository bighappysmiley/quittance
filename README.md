# Quittance

Private IOU and debt tracker — money and items, per account, with a thin mobile-first ledger.

## Features

- **Accounts** — sign up / sign in (data stored per account in the browser)
- **Ledger** — net position, All / Lent / Borrowed filters, outstanding people
- **Activity** — insights, who owes you most, timeline
- **New record** — lend or borrow, money or item, categories, photo, reminders
- **Settings** — theme, accent, currency, density, confirm toggle, JSON/CSV export & import
- **Demo ledger** — open with sample data matching the product screens

## Live

Working now: [https://quittanceledger.netlify.app](https://quittanceledger.netlify.app)

Custom domain `quittance.bhswebsite.org` needs a Cloudflare DNS CNAME (authoritative NS are Cloudflare, not Netlify):

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `quittance` | `quittanceledger.netlify.app` | Proxied |

Netlify auto-deploys from `main`.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and tap **Open demo ledger**.
