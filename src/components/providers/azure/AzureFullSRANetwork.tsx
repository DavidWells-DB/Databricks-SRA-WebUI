import { useEffect, useMemo } from 'react';
import { useConfig } from '../../../context/useConfig';
import CidrInput from '../../common/CidrInput';
import SecurityRulesDisplay from '../../network/SecurityRulesDisplay';
import NetworkDiagram from '../../network/NetworkDiagram';
import { subnetsOverlap } from '../../../lib/cidr/calculator';
import { isValidCidr } from '../../../lib/cidr/validator';

export default function AzureFullSRANetwork() {
  const { setField, getFieldValue } = useConfig();

  const hubResourceSuffix = (getFieldValue('hub_resource_suffix') as string) || '';
  const hubVnetCidr = (getFieldValue('hub_vnet_cidr') as string) || '';
  const workspaceVnet = (getFieldValue('workspace_vnet') as Record<string, unknown>) || {};
  const workspaceVnetCidr = (workspaceVnet.cidr as string) || '';
  const workspaceVnetNewBits = workspaceVnet.new_bits as number | undefined;

  useEffect(() => {
    if (!getFieldValue('hub_vnet_cidr')) {
      setField('hub_vnet_cidr', '10.0.0.0/22');
    }
    if (!getFieldValue('workspace_vnet')) {
      setField('workspace_vnet', { cidr: '10.1.0.0/22' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for hub/spoke CIDR overlap
  const cidrOverlap = useMemo(() => {
    if (isValidCidr(hubVnetCidr) && isValidCidr(workspaceVnetCidr)) {
      return subnetsOverlap(hubVnetCidr, workspaceVnetCidr);
    }
    return false;
  }, [hubVnetCidr, workspaceVnetCidr]);

  const inputClass =
    'w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <span className="font-semibold text-[var(--color-text)]">Full SRA:</span>{' '}
          The SRA creates hub infrastructure (VNet, Azure Firewall, Key Vault for CMK, route
          table) and spoke infrastructure (workspace VNet, private endpoints, UC storage
          account). By default, zero internet egress is allowed — configure allowed_fqdns in
          the Advanced step to permit specific outbound access.
        </p>
      </div>

      {/* Network Architecture Diagram */}
      <NetworkDiagram
        provider="azure"
        mode="full-sra"
        values={{ hub_vnet_cidr: hubVnetCidr, workspace_vnet: workspaceVnet }}
      />

      {/* Hub VNet Configuration */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Hub VNet
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-medium">Shared Infrastructure</span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          The hub VNet hosts Azure Firewall, Key Vault, route tables, and the WEBAUTH workspace. All spoke VNets peer to this hub.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Hub Resource Suffix
              <span className="ml-0.5 text-[var(--color-error)]">*</span>
            </label>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Suffix for hub resource names (firewall, VNet, etc.)
            </p>
            <input
              type="text"
              value={hubResourceSuffix}
              onChange={(e) => setField('hub_resource_suffix', e.target.value)}
              placeholder="srahub"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Hub VNet CIDR
              <span className="ml-0.5 text-[var(--color-error)]">*</span>
            </label>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Address space for the hub Virtual Network
            </p>
            <CidrInput
              value={hubVnetCidr}
              onChange={(val) => setField('hub_vnet_cidr', val)}
              placeholder="10.0.0.0/22"
            />
          </div>
        </div>
      </div>

      {/* Spoke (Workspace) VNet Configuration */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Workspace VNet
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] font-medium">Spoke / Compute Plane</span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          The spoke VNet hosts the Databricks workspace, container/host subnets, and private endpoints. It peers to the hub VNet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Workspace VNet CIDR
              <span className="ml-0.5 text-[var(--color-error)]">*</span>
            </label>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Address space for the spoke/workspace VNet
            </p>
            <CidrInput
              value={workspaceVnetCidr}
              onChange={(val) =>
                setField('workspace_vnet', { ...workspaceVnet, cidr: val })
              }
              placeholder="10.1.0.0/22"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              New Bits
              <span className="ml-1 text-xs font-normal text-[var(--color-text-tertiary)]">
                (optional)
              </span>
            </label>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Additional bits for subnet calculation within the spoke VNet
            </p>
            <input
              type="number"
              value={workspaceVnetNewBits ?? ''}
              onChange={(e) =>
                setField('workspace_vnet', {
                  ...workspaceVnet,
                  new_bits:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              placeholder="3"
              min={1}
              max={16}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* CIDR overlap warning */}
      {cidrOverlap && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--color-error)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[var(--color-error)]">VNet CIDR overlap detected</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              The Hub VNet CIDR ({hubVnetCidr}) and Workspace VNet CIDR ({workspaceVnetCidr}) overlap.
              Hub and spoke VNets must use non-overlapping address spaces for VNet peering to work.
            </p>
          </div>
        </div>
      )}

      {/* Firewall & NSG Rules */}
      <SecurityRulesDisplay provider="azure" />
    </div>
  );
}
