# Databricks SRA WebUI

A static React + TypeScript web wizard that generates `terraform.tfvars` files for the [Databricks Security Reference Architecture (SRA)](https://github.com/databricks/terraform-databricks-sra).

Deploys via GitHub Pages — no backend required. Everything runs in your browser.

## Supported deployment modes

- **AWS**: Isolated (SRA creates VPC) / Custom (BYO VPC)
- **Azure**: Full SRA / BYO Hub / BYO Spoke Network
- **GCP**: New VPC / Existing VPC

## Development

```bash
npm install
npm run dev              # Dev server on http://localhost:5173
npm run build            # Production build to dist/
npm test                 # Run vitest
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

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router (hash mode) · JSZip · Vitest
