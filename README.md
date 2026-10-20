# TaskLancer

Track work time and generate printable invoices with currency-aware totals and payments.

## Development

Use Node.js 26.x and Bun:

```sh
bun install --frozen-lockfile
bun run dev
```

Open the URL printed by Nuxt. To use a specific port, run `bun run dev --port 3018`.

## Checks

```sh
bun test
bun run typecheck
bunx eslint .
bun run build
```

Stop the dev server before building: Nuxt's development and production commands share generated files.

Type checking follows [Nuxt's TypeScript guidance](https://nuxt.com/docs/4.x/guide/concepts/typescript):
`bun run typecheck` runs `nuxt typecheck` with `vue-tsc`. TypeScript is pinned to
the 6.0 series for compatibility with the compiler API used by the current Vue
and ESLint tooling. The root `tsconfig.json` references Nuxt's generated app,
server, shared, and Node configurations.

## Invoices

Select the invoice currency before entering amounts. Currency codes identify amounts
in the form and on the printed invoice. Changing currency does not convert values.
The currency determines decimal precision; totals use integer minor units to preserve
cents. Negative line items represent discounts, and overpayments show a credit balance.

Print Invoice opens the browser's print dialog, where you can print or save as PDF.
