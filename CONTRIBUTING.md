# Contributing

Thanks for your interest in improving the Databricks SRA WebUI!

## Project status & support

This is an **unofficial, community-built tool**. It is not a Databricks product and has no SLA. Issues and pull requests will be reviewed on a best-effort basis.

For questions about the underlying [Databricks Security Reference Architecture](https://github.com/databricks/terraform-databricks-sra), file issues on the upstream repo — not here. This WebUI only generates configuration files; it doesn't change the SRA's behavior.

## Reporting bugs

Open an [issue](https://github.com/DavidWells-DB/Databricks-SRA-WebUI/issues/new/choose) using the bug report template. Please include:

- Cloud provider and deployment mode you were configuring (e.g. AWS Isolated)
- The wizard step where the issue occurred
- Browser + OS
- Console errors (if any) — open DevTools → Console
- A screenshot if relevant

**Do not include sensitive values** (account IDs, secrets, internal CIDR ranges). Sanitize anything you paste.

## Suggesting features

Open a feature request issue describing:
- The use case
- What the SRA Terraform supports today (link to `variables.tf` if relevant)
- Why a wizard UI improvement would help

## Pull requests

### Prerequisites

```bash
node --version  # >= 20
npm install
```

### Workflow

```bash
# Run dev server
npm run dev

# Run tests in watch mode while developing
npm run test:watch

# Type-check + build
npm run build

# Lint
npm run lint
```

### Before submitting

1. **All tests pass**: `npm test` (currently 184 tests)
2. **Build succeeds**: `npm run build`
3. **No type errors**: `npx tsc -p tsconfig.app.json --noEmit`

### What to expect

- PRs that fix bugs or add SRA-aligned features are welcome.
- PRs that add features the upstream SRA doesn't support will likely be declined — this tool's job is to generate configs the SRA can consume.
- Schema changes (`src/schemas/`) should reference the corresponding upstream variable in `terraform-databricks-sra`.

## Adding support for new SRA variables

When the upstream SRA adds or changes a variable:

1. Update the schema in `src/schemas/{provider}/variables.ts`
2. If it's user-facing, add it to the relevant deployment mode in `src/schemas/{provider}/modes.ts`
3. Update the generator in `src/lib/generators/{provider}-generator.ts` if it needs special handling (e.g. complex object structure, conditional output)
4. Add a test case to `tests/lib/generators/{provider}-generator.test.ts`
5. Run `npm test -- --update` to refresh snapshots if needed

## Code style

- TypeScript strict mode (no `any` unless justified with a comment)
- Functional React components, hooks for state
- Tailwind CSS v4 with CSS variables for theming
- No external state libraries (Context + useReducer is sufficient)

## License

By contributing, you agree your contributions will be licensed under the [Apache License 2.0](./LICENSE).
