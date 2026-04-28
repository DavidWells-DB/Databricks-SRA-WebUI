import { useEffect } from 'react';
import { useConfig } from '../../../context/ConfigContext';
import CidrInput from '../../common/CidrInput';
import ObjectInput from '../../common/ObjectInput';

export default function AzureBYOHubNetwork() {
  const { setField, getFieldValue } = useConfig();

  const metastoreId = (getFieldValue('databricks_metastore_id') as string) || '';
  const existingHubVnet =
    (getFieldValue('existing_hub_vnet') as Record<string, string>) || {};
  const existingNccId = (getFieldValue('existing_ncc_id') as string) || '';
  const existingNetworkPolicyId =
    (getFieldValue('existing_network_policy_id') as string) || '';
  const workspaceVnet =
    (getFieldValue('workspace_vnet') as Record<string, unknown>) || {};
  const workspaceVnetCidr = (workspaceVnet.cidr as string) || '';
  const workspaceVnetNewBits = workspaceVnet.new_bits as number | undefined;

  // Set defaults on mount
  useEffect(() => {
    if (!getFieldValue('workspace_vnet')) {
      setField('workspace_vnet', { cidr: '10.1.0.0/22' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const inputClass =
    'w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="space-y-6">
      {/* Info box */}
      <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
        <div className="flex gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-warning)]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-[var(--color-text-secondary)]">
            <p className="font-semibold text-[var(--color-text)] mb-1">
              BYO Hub: Prerequisites
            </p>
            <p>
              You must have already created the following resources in your Azure
              subscription before using this mode:
            </p>
            <ul className="mt-1 ml-4 list-disc space-y-0.5">
              <li>Hub VNet with route table and firewall</li>
              <li>Key Vault for customer-managed keys</li>
              <li>Network Connectivity Config (NCC)</li>
              <li>Network Policy</li>
              <li>Unity Catalog Metastore</li>
            </ul>
            <p className="mt-2 font-semibold">
              Note: SAT is not available in BYO Hub mode and must be deployed separately.
            </p>
          </div>
        </div>
      </div>

      {/* Metastore ID */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Metastore ID
          <span className="ml-0.5 text-[var(--color-error)]">*</span>
        </label>
        <p className="text-xs text-[var(--color-text-secondary)]">
          The ID of your existing Unity Catalog metastore.
        </p>
        <input
          type="text"
          value={metastoreId}
          onChange={(e) => setField('databricks_metastore_id', e.target.value)}
          placeholder="00000000-0000-0000-0000-000000000000"
          className={inputClass}
        />
      </div>

      {/* Existing Hub VNet */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Existing Hub VNet
          <span className="ml-0.5 text-[var(--color-error)]">*</span>
        </label>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Provide the route table ID and VNet ID of your existing hub network.
        </p>
        <ObjectInput
          value={existingHubVnet}
          onChange={(val) => setField('existing_hub_vnet', val)}
          fields={{
            route_table_id: {
              label: 'Route Table ID',
              placeholder:
                '/subscriptions/.../resourceGroups/.../providers/Microsoft.Network/routeTables/...',
              required: true,
            },
            vnet_id: {
              label: 'VNet ID',
              placeholder:
                '/subscriptions/.../resourceGroups/.../providers/Microsoft.Network/virtualNetworks/...',
              required: true,
            },
          }}
        />
      </div>

      {/* Existing NCC ID */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Existing NCC ID
          <span className="ml-0.5 text-[var(--color-error)]">*</span>
        </label>
        <p className="text-xs text-[var(--color-text-secondary)]">
          The Network Connectivity Configuration ID from your existing hub.
        </p>
        <input
          type="text"
          value={existingNccId}
          onChange={(e) => setField('existing_ncc_id', e.target.value)}
          placeholder="/subscriptions/.../networkConnectivityConfigurations/..."
          className={inputClass}
        />
      </div>

      {/* Existing Network Policy ID */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Existing Network Policy ID
          <span className="ml-0.5 text-[var(--color-error)]">*</span>
        </label>
        <p className="text-xs text-[var(--color-text-secondary)]">
          The Network Policy ID from your existing hub setup.
        </p>
        <input
          type="text"
          value={existingNetworkPolicyId}
          onChange={(e) => setField('existing_network_policy_id', e.target.value)}
          placeholder="00000000-0000-0000-0000-000000000000"
          className={inputClass}
        />
      </div>

      {/* Workspace VNet (inline card) */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          Workspace VNet Configuration
        </label>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Spoke network CIDR and optional subnet sizing for the new workspace VNet.
        </p>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4 space-y-4">
          {/* CIDR */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              CIDR
              <span className="ml-0.5 text-[var(--color-error)]">*</span>
            </label>
            <CidrInput
              value={workspaceVnetCidr}
              onChange={(val) =>
                setField('workspace_vnet', { ...workspaceVnet, cidr: val })
              }
              placeholder="10.1.0.0/22"
            />
          </div>

          {/* new_bits (optional) */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              New Bits
              <span className="ml-1 text-xs font-normal text-[var(--color-text-tertiary)]">
                (optional)
              </span>
            </label>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Number of additional bits for subnet calculation (default: 3).
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
    </div>
  );
}
