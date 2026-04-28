import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const providers = [
  {
    name: 'AWS',
    color: '#FF9900',
    tagline: 'Isolated VPC + PrivateLink',
    features: [
      'Customer-managed VPC with zero outbound internet',
      'Back-end PrivateLink connectivity',
      '3 KMS keys (workspace, services, Unity Catalog)',
      'VPC endpoints with restrictive policies',
      'Scoped-down cross-account IAM role',
      'GovCloud (civilian/DoD) supported',
    ],
  },
  {
    name: 'Azure',
    color: '#0078D4',
    tagline: 'Hub-and-Spoke + Azure Firewall',
    features: [
      'Hub-Spoke VNets with Azure Firewall egress',
      'VNet injection with Private Endpoints',
      'Customer-managed keys via Key Vault',
      'Zero-trust network egress',
      '3 deployment modes (Full / BYO Hub / BYO Spoke)',
      'Optional Security Analysis Tool (SAT)',
    ],
  },
  {
    name: 'GCP',
    color: '#4285F4',
    tagline: 'PSC + Cloud KMS',
    features: [
      'Customer-managed VPC with Private Google Access',
      'Back-end Private Service Connect (or Cloud NAT)',
      'Cloud KMS (CMEK) for storage and managed services',
      'Private Cloud DNS for PSC resolution',
      'Restrictive firewall rules (harden_network)',
    ],
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Pick your cloud',
    desc: 'AWS, Azure, or GCP — and your deployment mode',
  },
  {
    step: 2,
    title: 'Configure',
    desc: 'Account, network, security, and feature flags',
  },
  {
    step: 3,
    title: 'Review',
    desc: 'Inspect generated terraform.tfvars side-by-side',
  },
  {
    step: 4,
    title: 'Deploy',
    desc: 'Download and run terraform init && apply',
  },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '100% client-side',
    desc: 'Everything runs in your browser. No backend, no analytics, no data ever leaves your machine.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Interactive subnet sizing',
    desc: 'Drag a slider, watch CIDR blocks recalculate in real time. Visual subnet layout, IP-per-subnet stats.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
    title: 'Schema-driven',
    desc: 'Variables map 1:1 to the upstream SRA Terraform. When the SRA updates, only schema files need updating.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.405 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.405 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.69z" />
      </svg>
    ),
    title: 'Validates as you go',
    desc: 'Real-time CIDR overlap detection, format validation, and warnings when subnets exceed VPC capacity.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
      </svg>
    ),
    title: 'Clean output',
    desc: 'Only outputs values that differ from SRA defaults. Aligned formatting, syntax-highlighted preview.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'ZIP + README included',
    desc: 'Download a packaged ZIP with terraform.tfvars, deployment README, and .env.example for credentials.',
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-lg font-bold">
              <span className="text-[var(--color-primary)]">Databricks</span>
              <span className="text-[var(--color-text)]"> SRA</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/DavidWells-DB/Databricks-SRA-WebUI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.082z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated orbs */}
        <div className="orb orb-primary w-[500px] h-[500px] -top-40 -left-40" />
        <div className="orb orb-accent w-[600px] h-[600px] -top-20 -right-60" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
            </span>
            Powered by the official Databricks SRA Terraform templates
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6">
            <span className="text-[var(--color-text)]">Deploy a hardened</span>
            <br />
            <span className="text-gradient">Databricks workspace</span>
            <br />
            <span className="text-[var(--color-text)]">in minutes.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
            Generate production-ready{' '}
            <code className="px-2 py-0.5 rounded bg-[var(--color-surface-secondary)] text-base font-mono text-[var(--color-primary)]">
              terraform.tfvars
            </code>{' '}
            for the Databricks Security Reference Architecture across AWS, Azure, and GCP.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/configure"
              className="btn-shine btn-hover-lift inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-lg transition-colors"
            >
              Get Started
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
            <a
              href="https://github.com/databricks/terraform-databricks-sra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-secondary)] text-[var(--color-text)] font-medium text-base transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              View SRA Source
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No backend
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No analytics
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Open source · Apache 2.0
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Works offline
            </span>
          </div>
        </div>

        {/* App preview mockup */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
          <div className="preview-tilt rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] shadow-2xl overflow-hidden">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 rounded bg-[var(--color-surface-secondary)] text-xs font-mono text-[var(--color-text-tertiary)] text-center">
                /configure/network
              </div>
            </div>

            {/* Mock app content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--color-surface)]">
              <div className="md:col-span-1 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-[var(--color-success)]/15 text-[var(--color-success)] text-sm">
                  <span>{'\u2713'}</span> Provider & Mode
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-[var(--color-success)]/15 text-[var(--color-success)] text-sm">
                  <span>{'\u2713'}</span> Account
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-[var(--color-primary)] text-white text-sm font-medium">
                  <span>3</span> Network
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded text-[var(--color-text-tertiary)] text-sm">
                  <span>4</span> Security
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded text-[var(--color-text-tertiary)] text-sm">
                  <span>5</span> Advanced
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded text-[var(--color-text-tertiary)] text-sm">
                  <span>6</span> Review
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Subnet Size</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-3 text-center">
                    <div className="text-xl font-bold font-mono text-[var(--color-primary)]">/22</div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">Prefix</div>
                  </div>
                  <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-3 text-center">
                    <div className="text-xl font-bold font-mono text-[var(--color-text)]">1,024</div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">IPs</div>
                  </div>
                  <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-3 text-center">
                    <div className="text-xl font-bold font-mono text-[var(--color-text)]">~491</div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">Max Nodes</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="rounded border-l-2 border-[#3b82f6] bg-[var(--color-surface-secondary)] p-2">
                    <div className="text-[10px] font-bold text-[#3b82f6] mb-1">WORKSPACE 1</div>
                    <div className="font-mono text-xs text-[var(--color-text)]">10.0.0.0/22</div>
                  </div>
                  <div className="rounded border-l-2 border-[#3b82f6] bg-[var(--color-surface-secondary)] p-2">
                    <div className="text-[10px] font-bold text-[#3b82f6] mb-1">WORKSPACE 2</div>
                    <div className="font-mono text-xs text-[var(--color-text)]">10.0.4.0/22</div>
                  </div>
                  <div className="rounded border-l-2 border-[#3b82f6] bg-[var(--color-surface-secondary)] p-2">
                    <div className="text-[10px] font-bold text-[#3b82f6] mb-1">WORKSPACE 3</div>
                    <div className="font-mono text-xs text-[var(--color-text)]">10.0.8.0/22</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-12">
          <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-3">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            Designed for security teams
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Every input is validated. Every output matches the SRA's expected format.
            Every value you don't change uses the SRA's default.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-hover rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-6"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--color-surface-secondary)] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-3">
              Workflow
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              Four steps from zero to deployed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[var(--color-primary)]/30 via-[var(--color-primary)]/30 to-[var(--color-primary)]/30" />

            {workflowSteps.map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="relative w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg font-bold mb-4 shadow-lg shadow-[var(--color-primary)]/30 z-10">
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
        </div>
      </section>

      {/* Provider cards */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-12">
          <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-3">
            Cloud Providers
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            All three clouds, one wizard
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Each provider supports its full set of SRA deployment modes — Isolated, Custom, Hub-Spoke, BYO networks, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.name}
              className="card-hover rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] overflow-hidden"
            >
              <div
                className="h-1.5"
                style={{ background: p.color }}
              />
              <div className="p-6">
                <h3
                  className="text-2xl font-bold mb-1"
                  style={{ color: p.color }}
                >
                  {p.name}
                </h3>
                <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                  {p.tagline}
                </p>
                <ul className="space-y-2.5">
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
            </div>
          ))}
        </div>
      </section>

      {/* Critical next steps callout */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full">
        <div className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--color-warning)]/15 text-[var(--color-warning)] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)] mb-2">
                Critical next steps after deployment
              </h3>
              <ul className="space-y-1.5 text-sm text-[var(--color-text-secondary)]">
                <li>{'\u2022'} Implement front-end mitigation (IP Access Lists or Front-End PrivateLink/PSC)</li>
                <li>{'\u2022'} Configure SSO, MFA, and SCIM provisioning for identity management</li>
                <li>{'\u2022'} Deploy the Security Analysis Tool (SAT) for continuous monitoring</li>
                <li>{'\u2022'} Review the generated <code>terraform.tfvars</code> before running <code>terraform apply</code></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[var(--color-surface-secondary)] py-20">
        <div className="orb orb-primary w-[400px] h-[400px] -bottom-32 left-1/4 opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
            Ready to configure your SRA workspace?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">
            No signup. No backend. No data leaves your browser. Just a clean tfvars file at the end.
          </p>
          <Link
            to="/configure"
            className="btn-shine btn-hover-lift inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-lg transition-colors"
          >
            Start configuring
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-tertiary)]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Built for the Databricks Security Reference Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://databricks.github.io/terraform-databricks-sra/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-secondary)] transition-colors">
              SRA Docs
            </a>
            <span>·</span>
            <a href="https://github.com/databricks/terraform-databricks-sra" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-secondary)] transition-colors">
              SRA GitHub
            </a>
            <span>·</span>
            <a href="https://github.com/DavidWells-DB/Databricks-SRA-WebUI" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-secondary)] transition-colors">
              This repo
            </a>
            <span>·</span>
            <a href="https://github.com/DavidWells-DB/Databricks-SRA-WebUI/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-secondary)] transition-colors">
              Apache 2.0
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
