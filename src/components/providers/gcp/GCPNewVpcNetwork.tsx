import { useEffect } from 'react';
import { useConfig } from '../../../context/useConfig';
import { gcpSchema } from '../../../schemas/gcp/variables';
import FormField from '../../common/FormField';
import GCPPscSection from './GCPPscSection';
import NetworkDiagram from '../../network/NetworkDiagram';
import SecurityRulesDisplay from '../../network/SecurityRulesDisplay';

export default function GCPNewVpcNetwork() {
  const { getFieldValue, setField } = useConfig();

  useEffect(() => {
    if (getFieldValue('nodes_ip_cidr_range') === undefined) {
      setField('nodes_ip_cidr_range', '10.0.0.0/16');
    }
    if (getFieldValue('harden_network') === undefined) {
      setField('harden_network', true);
    }
    if (getFieldValue('ip_addresses') === undefined) {
      setField('ip_addresses', ['0.0.0.0/0']);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nodesIpVar = gcpSchema.variables.find((v) => v.name === 'nodes_ip_cidr_range');
  const hardenVar = gcpSchema.variables.find((v) => v.name === 'harden_network');
  const ipAddressesVar = gcpSchema.variables.find((v) => v.name === 'ip_addresses');

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <span className="font-semibold text-[var(--color-text)]">New VPC:</span>{' '}
          The SRA will create a new VPC with subnets and optional firewall rules.
          By default, a Cloud NAT is created for outbound connectivity. Enable
          Private Service Connect (PSC) below for fully private connectivity without internet access.
        </p>
      </div>

      {/* Network Architecture Diagram */}
      <NetworkDiagram
        provider="gcp"
        mode="new-vpc"
        values={{
          nodes_ip_cidr_range: getFieldValue('nodes_ip_cidr_range'),
          use_psc: getFieldValue('use_psc'),
        }}
      />

      {/* VPC Configuration */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            VPC Network
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-medium">Workspace</span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          The customer-managed VPC hosts Databricks workspace nodes. Private IP Google Access is enabled on the subnet.
        </p>

        {nodesIpVar && (
          <FormField
            variable={nodesIpVar}
            value={getFieldValue('nodes_ip_cidr_range')}
            onChange={setField}
          />
        )}
      </div>

      {/* Network Security */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Network Security
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-medium">Firewall</span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          When enabled, restrictive firewall rules deny all egress by default and allow only required Databricks and Google services.
        </p>

        {hardenVar && (
          <FormField
            variable={hardenVar}
            value={getFieldValue('harden_network')}
            onChange={setField}
          />
        )}
        {ipAddressesVar && (
          <FormField
            variable={ipAddressesVar}
            value={getFieldValue('ip_addresses')}
            onChange={setField}
          />
        )}
      </div>

      {/* Connectivity */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Backend Connectivity
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium">Control Plane</span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Choose how the workspace connects to the Databricks control plane. PSC provides fully private connectivity
          via Google backbone. Without PSC, a Cloud Router + Cloud NAT is created for outbound internet access.
        </p>

        <GCPPscSection showExistingPscEp={false} />
      </div>

      {/* Firewall Rules */}
      <SecurityRulesDisplay provider="gcp" />
    </div>
  );
}
