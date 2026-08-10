# AR CreditInvoice Dashboard

## Project overview

- Nuxt 3, Vue 3, TypeScript strict, and Tailwind CSS.
- Microsoft SQL Server database: `arvl`.
- The application reports CreditInvoice and BankInvoice data and provides local user/screen permission administration.
- Default development URL: `http://localhost:3400`.

## Main routes

- `/` — CreditInvoice and BankInvoice overview dashboard.
- `/daily` — daily CreditInvoice details joined to BankInvoice.
- `/users` — user administration or the current user's password page.
- `/screens` — screen administration; admin only.
- `/access` — per-user screen permissions; admin only.
- `/login` — credential login.

## Data rules

- Treat `dbo.CreditInvoice`, `dbo.CreditInvoice_ali`, and `dbo.vBankInvoice` as read-only.
- `CreditInvoice_ali` records are exposed as bank `KBAL`.
- Join CreditInvoice to BankInvoice with `ih_bank = invoice_type`, `ih_invdate = invoice_date`, and `ih_date = doc_date`.
- For `CreditInvoice` rows, use `ih_date + 1 day` as `ih_invdate` when `ih_bank = 'SCB'`.
- Date-range filtering for CreditInvoice uses `ih_invdate`, not `ih_date`.
- Date-range filtering for BankInvoice uses `invoice_date`.
- Use an inclusive end date with `< DATEADD(day, 1, @to)`.
- All user-supplied SQL values must use parameterized `mssql` requests.
- Only `UserInfo`, `ScreenInfo`, and `AccessScreenInfo` may be modified by application APIs.

## Date and number display

- Display user-facing dates as Gregorian `dd/mm/yyyy`.
- Keep API date parameters as ISO `yyyy-mm-dd`.
- Use the `Asia/Bangkok` timezone when converting timestamps.
- Format monetary values with two decimal places.

## Authentication and permissions

- Sessions use the signed HTTP-only `ar_session` cookie implemented in `server/utils/session.ts`.
- Passwords must be stored as bcrypt hashes; never store or log plaintext passwords.
- Admin users bypass screen permissions.
- Non-admin access must be checked in the sidebar, route middleware, and server API.
- Dashboard permission key: `creditinvoice_dashboard`.
- Daily detail permission key: `creditinvoice_daily`.

## Code organization

- Pages: `pages/`.
- Reusable Vue components: `components/`.
- Client composables: `composables/`.
- API handlers: `server/api/`.
- Database, auth, permission, and report helpers: `server/utils/`.
- Shared TypeScript interfaces: `types/`.
- Database setup script: `database/schema.sql`.
- Admin seed command: `scripts/seed-admin.mjs`.

## Environment and security

- Never commit `.env`, database passwords, admin passwords, or `NUXT_AUTH_SECRET`.
- Use `.env.example` as the configuration reference.
- Keep `SESSION_COOKIE_SECURE=false` only for local HTTP; use `true` behind HTTPS.
- Do not automatically execute `database/schema.sql` against production.
- Do not change transaction-table schemas or indexes unless explicitly requested.

## Verification

After relevant changes, run:

```bash
npm run typecheck
npm run build
```

For dependency changes, also run:

```bash
npm audit --omit=dev
```
