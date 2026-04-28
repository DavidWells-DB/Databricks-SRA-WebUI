interface NetworkDiagramProps {
  provider: 'aws' | 'azure' | 'gcp';
  mode: string;
  values: Record<string, unknown>;
}

/** A reusable card box for the network diagram. */
function DiagramBox({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: string[];
}) {
  return (
    <div className="flex-1 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h4 className="font-semibold text-sm text-[var(--color-text)]">{title}</h4>
      {subtitle && (
        <p className="text-xs font-mono text-[var(--color-primary)] mt-1">{subtitle}</p>
      )}
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Dashed connector line between diagram boxes. */
function Connector({ label }: { label?: string }) {
  return (
    <div className="flex items-center shrink-0">
      <div className="w-8 border-t-2 border-dashed border-[var(--color-border)]" />
      {label && (
        <span className="text-[10px] text-[var(--color-text-tertiary)] -mt-4 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

/** Arrow connector with a label. */
function ArrowConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center shrink-0 gap-0.5">
      <span className="text-[10px] text-[var(--color-text-tertiary)] whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center">
        <div className="w-6 border-t-2 border-dashed border-[var(--color-border)]" />
        <svg className="w-3 h-3 text-[var(--color-text-tertiary)] -ml-0.5" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 6l8-4v8z" />
        </svg>
      </div>
    </div>
  );
}

function AzureFullSRADiagram({ values }: { values: Record<string, unknown> }) {
  const hubCidr = (values.hub_vnet_cidr as string) || '10.0.0.0/22';
  const workspaceVnet = (values.workspace_vnet as Record<string, unknown>) || {};
  const spokeCidr = (workspaceVnet.cidr as string) || '10.1.0.0/22';

  return (
    <div className="flex items-stretch gap-0 flex-wrap sm:flex-nowrap">
      <DiagramBox
        title="Hub VNet"
        subtitle={hubCidr}
        items={['Azure Firewall', 'Key Vault (CMK)', 'Route Table']}
      />
      <Connector label="Peering" />
      <DiagramBox
        title="Spoke VNet"
        subtitle={spokeCidr}
        items={['Private Endpoints', 'Databricks Workspace', 'UC Storage']}
      />
    </div>
  );
}

function GCPDiagram({ values }: { values: Record<string, unknown> }) {
  const cidr = (values.nodes_ip_cidr_range as string) || '10.0.0.0/16';
  const usePsc = values.use_existing_psc === true || values.use_psc === true;

  if (usePsc) {
    return (
      <div className="flex items-stretch gap-0 flex-wrap sm:flex-nowrap">
        <DiagramBox
          title="GCP VPC"
          subtitle={cidr}
          items={['Subnets', 'Firewall Rules']}
        />
        <Connector />
        <DiagramBox
          title="PSC Endpoints"
          items={['Private DNS', 'Service Attachments']}
        />
        <ArrowConnector label="Google Backbone" />
        <DiagramBox
          title="Databricks Control Plane"
          items={['Fully Private', 'No Internet Egress']}
        />
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-0 flex-wrap sm:flex-nowrap">
      <DiagramBox
        title="GCP VPC"
        subtitle={cidr}
        items={['Subnets', 'Firewall Rules']}
      />
      <Connector />
      <DiagramBox
        title="Cloud NAT"
        items={['Cloud Router', 'NAT Gateway']}
      />
      <ArrowConnector label="Internet" />
      <DiagramBox
        title="Databricks Control Plane"
        items={['REST API', 'Webapp']}
      />
    </div>
  );
}

export default function NetworkDiagram({ provider, mode, values }: NetworkDiagramProps) {
  if (provider === 'azure' && mode === 'full-sra') {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
          Network Architecture
        </p>
        <AzureFullSRADiagram values={values} />
      </div>
    );
  }

  if (provider === 'gcp') {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
          Network Architecture
        </p>
        <GCPDiagram values={values} />
      </div>
    );
  }

  // AWS or unsupported — return nothing (AWS uses SubnetVisualizer)
  return null;
}
