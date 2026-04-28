import { Link } from 'react-router-dom';

const providers = [
  {
    name: 'AWS',
    color: '#FF9900',
    features: [
      'Customer-managed VPC with zero outbound internet (isolated mode)',
      'Back-end PrivateLink connectivity',
      '3 AWS KMS keys (workspace storage, managed services, Unity Catalog)',
      'VPC endpoints with restrictive policies (S3, STS, Kinesis)',
      'Scoped-down cross-account IAM role',
      'Audit log delivery to S3',
    ],
  },
  {
    name: 'Azure',
    color: '#0078D4',
    features: [
      'Hub-and-spoke VNets with Azure Firewall egress control',
      'VNet injection with Private Endpoints',
      'Customer-managed keys via Key Vault',
      'Zero-trust network egress (allowed_fqdns, hub_allowed_urls)',
      'Network Connectivity Configuration for serverless',
      'Optional Security Analysis Tool (SAT)',
    ],
  },
  {
    name: 'GCP',
    color: '#4285F4',
    features: [
      'Customer-managed VPC with Private Google Access',
      'Back-end Private Service Connect (PSC) or Cloud NAT',
      'Cloud KMS (CMEK) for managed services and workspace storage',
      'Private Cloud DNS for PSC service resolution',
      'Firewall rules for network hardening',
    ],
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Select Provider',
    desc: 'Choose AWS, Azure, or GCP and your deployment mode',
  },
  {
    step: 2,
    title: 'Configure',
    desc: 'Fill in account details, network, security, and advanced settings',
  },
  {
    step: 3,
    title: 'Review',
    desc: 'Preview generated terraform.tfvars with syntax highlighting',
  },
  {
    step: 4,
    title: 'Deploy',
    desc: 'Download the config and run terraform init, plan, apply',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-20 text-center bg-gradient-to-b from-[var(--color-primary)]/5 via-[var(--color-surface)] to-[var(--color-surface)]">
        <h1 className="text-4xl md:text-5xl font-bold max-w-3xl leading-tight text-gradient">
          Databricks SRA Configuration Generator
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl">
          Deploy Databricks with security best practices, governance &amp; compliance,
          and flexible &amp; extensible templates. Generate production-ready{' '}
          <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-secondary)] text-sm font-mono">
            terraform.tfvars
          </code>{' '}
          for the Security Reference Architecture.
        </p>
        <p className="text-sm text-[var(--color-text-tertiary)]">
          Everything runs in your browser. No data is sent to any server.
        </p>
        <Link
          to="/configure"
          className="btn-shine mt-4 inline-block px-8 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-lg transition-colors"
        >
          Get Started
        </Link>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-16 w-full">
        <h2 className="text-2xl font-bold text-[var(--color-text)] text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {workflowSteps.map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg font-bold mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Provider cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.name}
              className="card-hover rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-6"
              style={{ borderTop: `3px solid ${p.color}` }}
            >
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: p.color }}
              >
                {p.name}
              </h3>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    <span
                      className="mt-0.5 shrink-0"
                      style={{ color: p.color }}
                    >
                      {'\u2713'}
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Critical next steps note */}
        <div className="mt-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-5">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
            Critical Next Steps After Deployment
          </p>
          <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
            <li>
              {'\u2022'} Implement front-end mitigation (IP Access Lists or Front-End PrivateLink/PSC)
            </li>
            <li>
              {'\u2022'} Configure SSO, MFA, and SCIM provisioning for identity management
            </li>
            <li>
              {'\u2022'} Deploy the Security Analysis Tool (SAT) for continuous security monitoring
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
