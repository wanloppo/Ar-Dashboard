# AR CreditInvoice Dashboard

Nuxt 3 dashboard for read-only CreditInvoice and BankInvoice reporting on Microsoft SQL Server.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env`, configure the `arvl` database connection, and set a long random `NUXT_AUTH_SECRET`.
3. Run `database/schema.sql` manually on `arvl`.
4. Set a strong `ADMIN_PASSWORD`, then run `npm run seed:admin`.
5. Run `npm run dev` and open `http://localhost:3400`.

Keep `SESSION_COOKIE_SECURE=false` for local HTTP. Set it to `true` when the deployed app is served over HTTPS.

If the container reports `NUXT_AUTH_SECRET must be configured in production`, add a long random value to `.env`, for example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The app never writes to `CreditInvoice`, `CreditInvoice_ali`, or `vBankInvoice`. Application writes are limited to `UserInfo`, `ScreenInfo`, and `AccessScreenInfo`.

## Verification

```bash
npm run typecheck
npm run build
```

## Docker

```bash
docker build -t ar-creditinvoice-dashboard .
docker run --restart always -p 3400:3400 --env-file .env --name ar-creditinvoice-dashboard ar-creditinvoice-dashboard
```
