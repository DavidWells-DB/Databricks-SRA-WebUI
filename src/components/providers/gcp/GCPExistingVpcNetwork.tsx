import { useEffect } from 'react';
import { useConfig } from '../../../context/ConfigContext';
import { gcpSchema } from '../../../schemas/gcp/variables';
import FormField from '../../common/FormField';
import GCPPscSection from './GCPPscSection';
import SecurityRulesDisplay from '../../network/SecurityRulesDisplay';

export default function GCPExistingVpcNetwork() {
  const { getFieldValue, setField } = useConfig();

  useEffect(() => {
    if (getFieldValue('harden_network') === undefined) {
      setField('harden_network', true);
    }
    if (getFieldValue('ip_addresses') === undefined) {
      setField('ip_addresses', ['0.0.0.0/0']);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const existingVpcVar = gcpSchema.variables.find((v) => v.name === 'existing_vpc_name');
  const existingSubnetVar = gcpSchema.variables.find((v) => v.name === 'existing_subnet_name');
  const hardenVar = gcpSchema.variables.find((v) => v.name === 'harden_network');
  const ipAddressesVar = gcpSchema.variables.find((v) => v.name === 'ip_addresses');

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <span className="font-semibold text-[var(--color-text)]">Existing VPC:</span>{' '}
          Use your existing GCP VPC. When PSC is disabled, a Cloud NAT is created for
          outbound connectivity. Enable PSC for fully private connectivity, or use existing
          PSC endpoints.
        </p>
      </div>

      {/* VPC Configuration */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Existing VPC
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-medium">Workspace</span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Provide your existing VPC and subnet names. The SRA will configure the Databricks workspace to use them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {existingVpcVar && (
            <FormField
              variable={existingVpcVar}
              value={getFieldValue('existing_vpc_name')}
              onChange={setField}
            />
          )}
          {existingSubnetVar && (
            <FormField
              variable={existingSubnetVar}
              value={getFieldValue('existing_subnet_name')}
              onChange={setField}
            />
          )}
        </div>
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
          Choose how the workspace connects to the Databricks control plane. PSC provides fully private connectivity.
          Without PSC, a Cloud Router + Cloud NAT is created for outbound internet access.
        </p>

        <GCPPscSection showExistingPscEp={true} />
      </div>

      {/* Firewall Rules */}
      <SecurityRulesDisplay provider="gcp" />
    </div>
  );
}
