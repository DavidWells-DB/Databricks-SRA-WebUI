import JSZip from 'jszip';

// ─── Authentication env vars per provider (standard provider variables) ────

const PROVIDER_ENV_VARS: Record<string, { name: string; description: string }[]> = {
  aws: [
    { name: 'AWS_ACCESS_KEY_ID', description: 'AWS access key for authentication' },
    { name: 'AWS_SECRET_ACCESS_KEY', description: 'AWS secret access key' },
    { name: 'AWS_SESSION_TOKEN', description: 'AWS session token (if using temporary credentials)' },
    { name: 'DATABRICKS_CLIENT_ID', description: 'Databricks service principal client ID (OAuth M2M)' },
    { name: 'DATABRICKS_CLIENT_SECRET', description: 'Databricks service principal client secret' },
  ],
  azure: [
    { name: 'ARM_CLIENT_ID', description: 'Azure service principal client ID' },
    { name: 'ARM_CLIENT_SECRET', description: 'Azure service principal client secret' },
    { name: 'ARM_TENANT_ID', description: 'Azure AD tenant ID' },
    { name: 'DATABRICKS_CLIENT_ID', description: 'Databricks service principal client ID (OAuth M2M)' },
    { name: 'DATABRICKS_CLIENT_SECRET', description: 'Databricks service principal client secret' },
  ],
  gcp: [
    { name: 'DATABRICKS_GOOGLE_SERVICE_ACCOUNT', description: 'Google service account email for Databricks' },
    { name: 'GOOGLE_CREDENTIALS', description: 'Path to GCP service account key JSON file' },
    { name: 'DATABRICKS_CLIENT_ID', description: 'Databricks service principal client ID (OAuth M2M)' },
    { name: 'DATABRICKS_CLIENT_SECRET', description: 'Databricks service principal client secret' },
  ],
};

/**
 * Build the .env.example content for a given provider.
 */
function buildEnvExample(provider: string): string {
  const vars = PROVIDER_ENV_VARS[provider] ?? PROVIDER_ENV_VARS.aws;
  const providerLabel = provider.toUpperCase();

  const lines = [
    `# ${providerLabel} SRA - Authentication Environment Variables`,
    '# Copy this file to .env and fill in your values',
    '# Then run: source .env',
    '',
    '# Cloud Provider Authentication',
    `# See: ${provider === 'aws' ? 'https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-envvars.html' : provider === 'azure' ? 'https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/service_principal_client_secret' : 'https://cloud.google.com/docs/authentication/application-default-credentials'}`,
    ...vars
      .filter((v) => !v.name.startsWith('DATABRICKS_'))
      .map((v) => `# ${v.description}\nexport ${v.name}=""`),
    '',
    '# Databricks Authentication (OAuth M2M)',
    '# See: https://registry.terraform.io/providers/databricks/databricks/latest/docs#argument-reference',
    ...vars
      .filter((v) => v.name.startsWith('DATABRICKS_'))
      .map((v) => `# ${v.description}\nexport ${v.name}=""`),
    '',
  ];

  return lines.join('\n');
}

/**
 * Generate a ZIP archive containing deployment files.
 */
export async function generateProjectZip(
  provider: string,
  tfvarsContent: string,
  readmeContent: string,
): Promise<Blob> {
  const zip = new JSZip();

  zip.file('terraform.tfvars', tfvarsContent);
  zip.file('README.md', readmeContent);
  zip.file('.env.example', buildEnvExample(provider));

  return zip.generateAsync({ type: 'blob' });
}
