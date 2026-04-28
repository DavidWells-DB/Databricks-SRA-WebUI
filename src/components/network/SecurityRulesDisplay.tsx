import type { Provider } from '../../schemas/types';

interface SecurityRule {
  protocol: string;
  ports: string;
  direction: 'INGRESS' | 'EGRESS' | 'BOTH';
  target: string;
  description: string;
  conditional?: string;
}

const AWS_WORKSPACE_SG_RULES: SecurityRule[] = [
  { protocol: 'TCP', ports: '0–65535', direction: 'INGRESS', target: 'Self (workspace SG)', description: 'Internode communication' },
  { protocol: 'UDP', ports: '0–65535', direction: 'INGRESS', target: 'Self (workspace SG)', description: 'Internode communication' },
  { protocol: 'TCP', ports: '0–65535', direction: 'EGRESS', target: 'Self (workspace SG)', description: 'Internode communication' },
  { protocol: 'UDP', ports: '0–65535', direction: 'EGRESS', target: 'Self (workspace SG)', description: 'Internode communication' },
  { protocol: 'TCP', ports: 'Per sg_egress_ports', direction: 'EGRESS', target: 'VPC CIDR', description: '443, 2443, 5432, 6666, 8443–8451' },
  { protocol: 'TCP', ports: '443', direction: 'EGRESS', target: 'S3 prefix list', description: 'S3 Gateway Endpoint access' },
];

const AWS_PRIVATELINK_SG_RULES: SecurityRule[] = [
  { protocol: 'TCP', ports: '443', direction: 'INGRESS', target: 'From workspace SG', description: 'REST API' },
  { protocol: 'TCP', ports: '2443', direction: 'INGRESS', target: 'From workspace SG', description: 'Secure Cluster Connectivity (CSP)' },
  { protocol: 'TCP', ports: '5432', direction: 'INGRESS', target: 'From workspace SG', description: 'Lakebase PostgreSQL' },
  { protocol: 'TCP', ports: '6666', direction: 'INGRESS', target: 'From workspace SG', description: 'SCC (excluded in GovCloud)', conditional: 'commercial only' },
  { protocol: 'TCP', ports: '8443', direction: 'INGRESS', target: 'From workspace SG', description: 'Compute → Control Plane internal' },
  { protocol: 'TCP', ports: '8444', direction: 'INGRESS', target: 'From workspace SG', description: 'UC logging & lineage streaming' },
  { protocol: 'TCP', ports: '8445–8451', direction: 'INGRESS', target: 'From workspace SG', description: 'Future extendability' },
];

const AWS_VPC_ENDPOINTS: SecurityRule[] = [
  { protocol: 'TCP', ports: '443', direction: 'EGRESS', target: 'S3 Gateway Endpoint', description: 'Restrictive policy: workspace bucket, UC catalog, artifacts, system tables, logs' },
  { protocol: 'TCP', ports: '443', direction: 'EGRESS', target: 'STS Interface Endpoint', description: 'Restrictive policy: AssumeRole, GetSessionToken, TagSession' },
  { protocol: 'TCP', ports: '443', direction: 'EGRESS', target: 'Kinesis Interface Endpoint', description: 'Restrictive policy: PutRecord, PutRecords, DescribeStream' },
  { protocol: 'TCP', ports: '443, 6666, 2443', direction: 'EGRESS', target: 'Databricks Backend REST Endpoint', description: 'Workspace API PrivateLink' },
  { protocol: 'TCP', ports: '443, 6666, 2443', direction: 'EGRESS', target: 'Databricks Backend Relay Endpoint', description: 'SCC Relay PrivateLink' },
];

const AZURE_FIREWALL_RULES: SecurityRule[] = [
  { protocol: 'TCP', ports: '443', direction: 'EGRESS', target: 'Azure AD', description: 'NSG: Azure Active Directory' },
  { protocol: 'TCP', ports: '443', direction: 'EGRESS', target: 'Azure Front Door', description: 'NSG: Azure Front Door Frontend' },
  { protocol: 'TCP+UDP', ports: '443', direction: 'EGRESS', target: 'Azure Storage', description: 'Firewall: Storage service tag' },
  { protocol: 'TCP', ports: '3306', direction: 'EGRESS', target: 'Azure SQL', description: 'Firewall: SQL service tag' },
  { protocol: 'TCP', ports: '9093', direction: 'EGRESS', target: 'Azure Event Hub', description: 'Firewall: EventHub service tag' },
  { protocol: 'HTTPS', ports: '443, 8080, 80', direction: 'EGRESS', target: 'ipinfo.io', description: 'Firewall: IP information service' },
  { protocol: 'HTTPS', ports: '443', direction: 'EGRESS', target: 'cdnjs.cloudflare.com', description: 'Firewall: Ganglia CDN' },
];

const GCP_RULES: SecurityRule[] = [
  { protocol: 'ALL', ports: 'All', direction: 'EGRESS', target: '0.0.0.0/0', description: 'Deny all egress (priority 1100)', conditional: 'harden_network' },
  { protocol: 'TCP', ports: '80, 443', direction: 'INGRESS', target: 'GCP Health Checks', description: 'Allow from 130.211.0.0/22, 35.191.0.0/16', conditional: 'harden_network' },
  { protocol: 'TCP', ports: '80, 443', direction: 'EGRESS', target: 'GCP Health Checks', description: 'Allow to 130.211.0.0/22, 35.191.0.0/16', conditional: 'harden_network' },
  { protocol: 'ALL', ports: 'All', direction: 'EGRESS', target: 'Intra-subnet', description: 'Allow within workspace subnet', conditional: 'harden_network' },
  { protocol: 'ALL', ports: 'All', direction: 'EGRESS', target: 'Google APIs (199.36.153.4/30)', description: 'Allow to Google API ranges', conditional: 'harden_network' },
  { protocol: 'TCP', ports: '443, 8443–8463', direction: 'EGRESS', target: 'PSC Endpoints', description: 'Allow to PSC endpoint IPs', conditional: 'harden_network + use_psc' },
  { protocol: 'TCP', ports: '443, 8443–8451', direction: 'EGRESS', target: 'Databricks Control Plane', description: 'Allow to control plane IPs (non-PSC only)', conditional: 'harden_network + !use_psc' },
];

function protocolColor(protocol: string): string {
  switch (protocol) {
    case 'TCP': return 'bg-[#3b82f6]/15 text-[#3b82f6]';
    case 'TCP+UDP': return 'bg-[#8b5cf6]/15 text-[#8b5cf6]';
    case 'UDP': return 'bg-[#f59e0b]/15 text-[#f59e0b]';
    case 'HTTPS': return 'bg-[#10b981]/15 text-[#10b981]';
    case 'ALL': return 'bg-[var(--color-text-tertiary)]/15 text-[var(--color-text-tertiary)]';
    default: return 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]';
  }
}

function directionBadge(dir: string): string {
  switch (dir) {
    case 'INGRESS': return 'bg-[#10b981]/10 text-[#10b981]';
    case 'EGRESS': return 'bg-[#f59e0b]/10 text-[#f59e0b]';
    case 'BOTH': return 'bg-[#8b5cf6]/10 text-[#8b5cf6]';
    default: return 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]';
  }
}

function RuleRow({ rule }: { rule: SecurityRule }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-sm">
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${protocolColor(rule.protocol)}`}>
        {rule.protocol}
      </span>
      <span className="font-mono text-[var(--color-text)] text-xs">{rule.ports}</span>
      <span className="text-[var(--color-text-tertiary)]">→</span>
      <span className="text-[var(--color-text)]">{rule.target}</span>
      <span className="ml-auto text-[var(--color-text-tertiary)] text-xs hidden sm:inline">{rule.description}</span>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${directionBadge(rule.direction)}`}>
        {rule.direction}
      </span>
    </div>
  );
}

interface SecurityRulesDisplayProps {
  provider: Provider;
  title?: string;
}

function RuleSection({ title, rules, subtitle }: { title: string; rules: SecurityRule[]; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-[var(--color-text)]">{title}</h4>
      {subtitle && <p className="text-xs text-[var(--color-text-tertiary)]">{subtitle}</p>}
      <div className="space-y-1.5">
        {rules.map((rule, i) => (
          <RuleRow key={i} rule={rule} />
        ))}
      </div>
    </div>
  );
}

export default function SecurityRulesDisplay({ provider, title }: SecurityRulesDisplayProps) {
  if (provider === 'aws') {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
        <h3 className="text-base font-semibold text-[var(--color-text)]">
          {title ?? 'Network Security (managed by SRA)'}
        </h3>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          These security groups, endpoints, and policies are created automatically. The configurable TCP egress ports are listed separately below.
        </p>

        <RuleSection
          title="Workspace Security Group"
          subtitle="{prefix}-workspace-sg — controls traffic for compute nodes"
          rules={AWS_WORKSPACE_SG_RULES}
        />

        <RuleSection
          title="PrivateLink Security Group"
          subtitle="{prefix}-privatelink-sg — controls traffic to Databricks PrivateLink endpoints"
          rules={AWS_PRIVATELINK_SG_RULES}
        />

        <RuleSection
          title="VPC Endpoints (Restrictive Policies)"
          subtitle="Gateway and interface endpoints with scoped-down IAM policies"
          rules={AWS_VPC_ENDPOINTS}
        />

        <Legend />
      </div>
    );
  }

  const rules = provider === 'azure' ? AZURE_FIREWALL_RULES
    : provider === 'gcp' ? GCP_RULES
    : [];

  if (rules.length === 0) return null;

  const heading = title ?? (
    provider === 'azure' ? 'Firewall & NSG Rules (managed by SRA)'
    : 'Firewall Rules (when harden_network = true)'
  );

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
      <h3 className="text-base font-semibold text-[var(--color-text)]">{heading}</h3>
      <p className="text-xs text-[var(--color-text-tertiary)]">
        {provider === 'azure' && 'The SRA creates NSG rules on the spoke VNet and Azure Firewall rules in the hub. Outbound FQDN access is controlled via allowed_fqdns in the Advanced step.'}
        {provider === 'gcp' && 'When harden_network is enabled, the SRA creates restrictive firewall rules. A default deny-all-egress rule is applied, with specific allow rules for required services.'}
      </p>
      <div className="space-y-1.5">
        {rules.map((rule, i) => (
          <RuleRow key={i} rule={rule} />
        ))}
      </div>
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-tertiary)]">
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-[#3b82f6]" /> TCP
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-[#8b5cf6]" /> UDP
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-[#10b981]" /> HTTPS
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-text-tertiary)]" /> ALL
      </span>
    </div>
  );
}
