import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/useConfig';
import { awsSchema } from '../../schemas/aws/variables';
import { azureSchema } from '../../schemas/azure/variables';
import { gcpSchema } from '../../schemas/gcp/variables';
import { generateAwsTfvars } from '../../lib/generators/aws-generator';
import { generateAzureTfvars } from '../../lib/generators/azure-generator';
import { generateGcpTfvars } from '../../lib/generators/gcp-generator';
import { generateReadme } from '../../lib/generators/readme-generator';
import { generateProjectZip } from '../../lib/zip/packager';
import type { DeploymentMode, SchemaVariable } from '../../schemas/types';

// ─── Constants ─────────────────────────────────────────────────────────────

/** Map step IDs to wizard paths for "Edit" links */
const STEP_PATHS: Record<string, string> = {
  account: '/configure/account',
  network: '/configure/network',
  security: '/configure/security',
  advanced: '/configure/advanced',
};

/** Friendly labels for each group */
const GROUP_LABELS: Record<string, string> = {
  account: 'Account & Identity',
  network: 'Network',
  security: 'Security',
  advanced: 'Advanced',
};

/** Groups to display in order */
const GROUP_ORDER = ['account', 'network', 'security', 'advanced'];

/** Authentication environment variables per provider (standard provider vars) */
const AUTH_ENV_VARS: Record<string, string[]> = {
  aws: [
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
    'DATABRICKS_CLIENT_ID', 'DATABRICKS_CLIENT_SECRET',
  ],
  azure: [
    'ARM_CLIENT_ID', 'ARM_CLIENT_SECRET', 'ARM_TENANT_ID',
    'DATABRICKS_CLIENT_ID', 'DATABRICKS_CLIENT_SECRET',
  ],
  gcp: [
    'DATABRICKS_GOOGLE_SERVICE_ACCOUNT', 'GOOGLE_CREDENTIALS',
    'DATABRICKS_CLIENT_ID', 'DATABRICKS_CLIENT_SECRET',
  ],
};

/** Deployment step definition */
interface DeploymentStep {
  title: string;
  description: string;
  command?: string;
}

/** Build provider-specific deployment steps */
function getDeploymentSteps(provider: string | null): DeploymentStep[] {
  const tfDir =
    provider === 'aws'
      ? 'aws/tf'
      : provider === 'azure'
        ? 'azure/tf'
        : 'gcp/modules/workspace_deployment';

  const envExports =
    provider === 'aws'
      ? '# AWS authentication\nexport AWS_ACCESS_KEY_ID="<your-access-key>"\nexport AWS_SECRET_ACCESS_KEY="<your-secret-key>"\n\n# Databricks authentication (OAuth M2M)\nexport DATABRICKS_CLIENT_ID="<your-client-id>"\nexport DATABRICKS_CLIENT_SECRET="<your-client-secret>"'
      : provider === 'azure'
        ? '# Azure authentication\nexport ARM_CLIENT_ID="<your-client-id>"\nexport ARM_CLIENT_SECRET="<your-client-secret>"\nexport ARM_TENANT_ID="<your-tenant-id>"\n\n# Databricks authentication (OAuth M2M)\nexport DATABRICKS_CLIENT_ID="<your-client-id>"\nexport DATABRICKS_CLIENT_SECRET="<your-client-secret>"'
        : '# GCP authentication\nexport DATABRICKS_GOOGLE_SERVICE_ACCOUNT="<service-account-email>"\nexport GOOGLE_CREDENTIALS="<path-to-key.json>"\n\n# Databricks authentication (OAuth M2M)\nexport DATABRICKS_CLIENT_ID="<your-client-id>"\nexport DATABRICKS_CLIENT_SECRET="<your-client-secret>"';

  return [
    {
      title: 'Clone the SRA repository',
      description: 'Download the official Databricks SRA Terraform modules.',
      command: 'git clone https://github.com/databricks/terraform-databricks-sra.git',
    },
    {
      title: 'Copy your terraform.tfvars',
      description: `Place the generated file into the correct provider directory.`,
      command: `cp terraform.tfvars terraform-databricks-sra/${tfDir}/`,
    },
    {
      title: 'Set environment variables',
      description: 'Export sensitive credentials so Terraform can authenticate.',
      command: envExports,
    },
    {
      title: 'Initialize Terraform',
      description: 'Download providers and initialize the working directory.',
      command: `cd terraform-databricks-sra/${tfDir}\nterraform init`,
    },
    {
      title: 'Review the plan',
      description: 'Preview the resources Terraform will create before applying.',
      command: 'terraform plan',
    },
    {
      title: 'Deploy',
      description: 'Apply the configuration to create your SRA infrastructure.',
      command: 'terraform apply',
    },
  ];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function maskValue(val: string): string {
  if (!val || val.length <= 4) return '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
  return '\u2022'.repeat(val.length - 4) + val.slice(-4);
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '\u2014';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

/**
 * Lightweight HCL syntax highlighter.
 * Returns an array of JSX spans with colour classes.
 */
function highlightHcl(code: string): React.ReactElement[] {
  return code.split('\n').map((line, i) => {
    let styled: React.ReactElement;

    if (/^\s*#/.test(line)) {
      // Comment line
      styled = <span style={{ color: 'var(--color-text-tertiary, #6b7280)' }}>{line}</span>;
    } else {
      // Key = value line -- highlight values
      const parts = line.match(/^(\s*\S+\s*=\s*)(.*)$/);
      if (parts) {
        const [, key, value] = parts;
        let valueColor = 'var(--color-text)';

        if (/^".*"/.test(value.trim())) {
          valueColor = '#22c55e'; // green for strings
        } else if (/^(true|false)/.test(value.trim())) {
          valueColor = '#3b82f6'; // blue for booleans
        } else if (/^\d/.test(value.trim())) {
          valueColor = '#f97316'; // orange for numbers
        } else if (/^null/.test(value.trim())) {
          valueColor = '#a855f7'; // purple for null
        } else if (/^\[/.test(value.trim())) {
          valueColor = '#22c55e'; // green for lists (usually strings)
        }

        // Check for trailing comment
        const commentMatch = value.match(/(.*?)(#.*)$/);
        if (commentMatch) {
          const [, valPart, commentPart] = commentMatch;
          styled = (
            <span>
              {key}
              <span style={{ color: valueColor }}>{valPart}</span>
              <span style={{ color: 'var(--color-text-tertiary, #6b7280)' }}>{commentPart}</span>
            </span>
          );
        } else {
          styled = (
            <span>
              {key}
              <span style={{ color: valueColor }}>{value}</span>
            </span>
          );
        }
      } else {
        styled = <span>{line}</span>;
      }
    }

    return (
      <span key={i}>
        {styled}
        {'\n'}
      </span>
    );
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Step6_Review() {
  const { state, completeStep } = useConfig();
  const navigate = useNavigate();
  const { provider, deploymentMode, values } = state;
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Resolve the schema and mode
  const schema =
    provider === 'aws'
      ? awsSchema
      : provider === 'azure'
        ? azureSchema
        : provider === 'gcp'
          ? gcpSchema
          : null;
  const mode: DeploymentMode | undefined = schema?.deploymentModes.find(
    (m) => m.id === deploymentMode,
  );

  // ── Generate the tfvars content ──────────────────────────────────────────
  const tfvarsContent = useMemo(() => {
    if (!mode) return '';
    if (provider === 'azure') return generateAzureTfvars(values, mode);
    if (provider === 'gcp') return generateGcpTfvars(values, mode);
    return generateAwsTfvars(values, mode);
  }, [values, mode, provider]);

  // ── Group variables for the summary table ────────────────────────────────
  const groupedVars = useMemo(() => {
    if (!schema || !mode) return {};

    const groups: Record<string, { variable: SchemaVariable; value: unknown }[]> = {};

    for (const group of GROUP_ORDER) {
      const vars = schema.variables
        .filter((v) => v.ui.group === group && mode.variables.includes(v.name))
        .sort((a, b) => a.ui.order - b.ui.order)
        .map((variable) => ({
          variable,
          value: values[variable.name] ?? mode.fixedValues[variable.name] ?? variable.default,
        }));

      if (vars.length > 0) {
        groups[group] = vars;
      }
    }

    return groups;
  }, [schema, mode, values]);

  // ── Clipboard ────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(tfvarsContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = tfvarsContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [tfvarsContent]);

  // ── Download ZIP ─────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!provider || !deploymentMode) return;
    setDownloading(true);
    try {
      const readme = generateReadme(provider, deploymentMode);
      const blob = await generateProjectZip(provider, tfvarsContent, readme);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sra-${provider}-${deploymentMode}-config.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      completeStep('review');
    } finally {
      setDownloading(false);
    }
  }, [provider, deploymentMode, tfvarsContent, completeStep]);

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!schema || !mode) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
          Review & Download
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Please complete the previous steps before reviewing your configuration.
        </p>
        <button
          type="button"
          onClick={() => navigate('/configure')}
          className="mt-4 px-5 py-2 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Go to Step 1
        </button>
      </div>
    );
  }

  const envVars = AUTH_ENV_VARS[provider ?? 'aws'] ?? [];

  return (
    <div className="max-w-4xl">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <h2 className="text-2xl font-bold mb-2 text-gradient">
        Review & Download
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Review your configuration and download the deployment package.
      </p>

      {/* ── Configuration Summary ───────────────────────────────────────────── */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Configuration Summary
        </h3>

        <div className="space-y-4">
          {/* Mode badge */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Deployment Mode
                </span>
                <p className="font-medium text-[var(--color-text)]">{mode.label}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/configure')}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Grouped variable cards */}
          {GROUP_ORDER.map((group) => {
            const vars = groupedVars[group];
            if (!vars || vars.length === 0) return null;

            return (
              <div
                key={group}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                  <h4 className="font-medium text-[var(--color-text)]">
                    {GROUP_LABELS[group] ?? group}
                  </h4>
                  {STEP_PATHS[group] && (
                    <button
                      type="button"
                      onClick={() => navigate(STEP_PATHS[group])}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[var(--color-border)]">
                  {vars.map(({ variable, value }) => {
                    const display =
                      variable.sensitive && typeof value === 'string' && value
                        ? maskValue(value)
                        : formatValue(value);

                    return (
                      <div
                        key={variable.name}
                        className="flex items-center justify-between px-4 py-2.5 text-sm"
                      >
                        <span className="text-[var(--color-text-secondary)]">
                          {variable.ui.label}
                        </span>
                        <span className="font-mono text-[var(--color-text)] text-right max-w-[50%] truncate">
                          {display}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Sensitive Fields Notice ──────────────────────────────────────────── */}
      {envVars.length > 0 && (
        <section className="mb-8">
          <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <h4 className="font-semibold text-[var(--color-text)] mb-2">
              Environment Variables Required
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
              The following sensitive values should be set as environment variables rather
              than stored in plain-text files. Add them to your shell or use the included{' '}
              <code className="text-xs bg-[var(--color-surface-secondary)] px-1 py-0.5 rounded">
                .env.example
              </code>{' '}
              file:
            </p>
            <pre className="bg-[var(--color-bg)] rounded-md p-3 text-sm font-mono text-[var(--color-text)] overflow-x-auto">
              {envVars.map((v) => `export ${v}="<your-value>"`).join('\n')}
            </pre>
          </div>
        </section>
      )}

      {/* ── Generated terraform.tfvars Preview ──────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Generated terraform.tfvars
          </h3>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
          <pre className="code-terminal p-4 text-sm font-mono leading-relaxed whitespace-pre overflow-x-auto max-h-96 overflow-y-auto">
            {highlightHcl(tfvarsContent)}
          </pre>
        </div>
      </section>

      {/* ── Action Buttons ──────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="btn-shine flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download ZIP
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy to Clipboard
          </button>
        </div>
      </section>

      {/* Security Warnings */}
      <section className="mb-8">
        <div className="rounded-lg border-l-4 border-[var(--color-warning)] bg-[var(--color-warning)]/5 p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[var(--color-warning)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <h4 className="font-semibold text-[var(--color-text)] mb-2">Before Deploying</h4>
              <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                <li>• Set authentication credentials via environment variables (see .env.example) — never commit secrets to source control</li>
                <li>• Review all generated files before running <code>terraform apply</code></li>
                <li>• Ensure you have appropriate IAM / RBAC permissions in your cloud account</li>
                <li>• After deployment, configure front-end PrivateLink or IP Access Lists</li>
                <li>• Set up SSO, MFA, and SCIM provisioning for identity management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Deployment Timeline ──────────────────────────────────────────────── */}
      <section className="mb-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6">Deployment Steps</h3>
          <div className="relative space-y-8 pl-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
            {getDeploymentSteps(provider).map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-8 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--color-text)] mb-1">{step.title}</h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">{step.description}</p>
                  {step.command && (
                    <pre className="code-terminal text-sm bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-2 overflow-x-auto font-mono text-[var(--color-text)]">
                      {step.command}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Back navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-8 mt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => navigate('/configure/advanced')}
          className="px-5 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors font-medium"
        >
          Back
        </button>
        <div />
      </div>
    </div>
  );
}
