# Databricks SRA WebUI

A static React + TypeScript web wizard that generates `terraform.tfvars` files for the [Databricks Security Reference Architecture (SRA)](https://github.com/databricks/terraform-databricks-sra).

🌐 **[Try it live →](https://davidwells-db.github.io/Databricks-SRA-WebUI/)**

Deploys via GitHub Pages — no backend required. Everything runs in your browser. Nothing is sent to any server.

> **Disclaimer**: This is an unofficial, community-built tool. It is **not** a Databricks product and is not officially supported by Databricks. It generates configuration files for the official [SRA Terraform templates](https://github.com/databricks/terraform-databricks-sra) but does not deploy any infrastructure. Always review the generated configuration before running `terraform apply`.

## What it does

1. Walks you through a guided wizard for AWS, Azure, or GCP
2. Configures network, security, encryption, and feature flags via interactive forms
3. Generates a `terraform.tfvars` file matching the SRA's expected format
4. Packages it into a downloadable ZIP with deployment instructions

## Supported deployment modes

| Provider | Modes |
|----------|-------|
| **AWS** | Isolated (SRA creates VPC) · Custom (BYO VPC) |
| **Azure** | Full SRA · BYO Hub · BYO Spoke Network |
| **GCP** | New VPC · Existing VPC |

## Local development

```bash
npm install
npm run dev              # Dev server on http://localhost:5173
npm run build            # Production build to dist/
npm test                 # Run vitest (184 unit tests)
npm run test:watch       # Vitest watch mode
```

## Architecture

### Schema-driven design

The app is driven by schema files in `src/schemas/{provider}/`. Each SRA Terraform variable maps to a `SchemaVariable` definition. When the upstream SRA `variables.tf` changes, only the schema files need updating — no form components, generators, or validation logic change.

- `src/schemas/types.ts` — Core types (`SchemaVariable`, `DeploymentMode`, `ProviderSchema`, `Condition`)
- `src/schemas/{aws,azure,gcp}/variables.ts` — Variable definitions
- `src/schemas/{aws,azure,gcp}/modes.ts` — Deployment mode definitions
- `src/schemas/{aws,azure,gcp}/regions.ts` — Region data

### Key directories

- `src/lib/cidr/` — Pure CIDR math (calculator, validator). Zero React deps, heavily unit tested.
- `src/lib/generators/` — tfvars HCL generation per provider. Output matches the SRA `template.tfvars.example` files.
- `src/lib/zip/packager.ts` — Client-side ZIP generation via JSZip.
- `src/components/common/` — Schema-driven form components.
- `src/components/steps/` — 6-step wizard: Provider+Mode → Account → Network → Security → Advanced → Review+Download
- `src/components/providers/{aws,azure,gcp}/` — Provider-specific network configuration UIs.
- `src/context/ConfigContext.tsx` — Central state with localStorage persistence.

### tfvars generation principle

The generator only outputs variables where the user's value differs from the Terraform default. Required variables (no Terraform default) are always output. This keeps the generated file clean and minimizes drift when the SRA updates its defaults.

## Privacy

- **No analytics, no cookies, no tracking.**
- All form values stay in your browser's localStorage.
- Sensitive fields (account IDs, secrets) are excluded from localStorage by default.
- The downloaded ZIP is generated client-side — nothing leaves your machine.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and pull requests welcome.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router (hash mode) · JSZip · Vitest

## License

[Apache License 2.0](./LICENSE)

The Databricks Security Reference Architecture (which this tool generates configs for) is published by Databricks under its own license at [databricks/terraform-databricks-sra](https://github.com/databricks/terraform-databricks-sra).
