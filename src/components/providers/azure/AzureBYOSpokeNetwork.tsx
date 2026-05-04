import { useConfig } from '../../../context/ConfigContext';
import ObjectInput from '../../common/ObjectInput';

export default function AzureBYOSpokeNetwork() {
  const { setField, getFieldValue } = useConfig();

  const metastoreId = (getFieldValue('databricks_metastore_id') as string) || '';
  const existingHubVnet =
    (getFieldValue('existing_hub_vnet') as Record<string, string>) || {};
  const existingNccId = (getFieldValue('existing_ncc_id') as string) || '';
  const existingNetworkPolicyId =
    (getFieldValue('existing_network_policy_id') as string) || '';
  const existingResourceGroupName =
    (getFieldValue('existing_resource_group_name') as string) || '';

  // existing_workspace_vnet is stored as a flat object; we break it into
  // network_configuration and dns_zone_ids groups for display, then merge back.
  const existingWorkspaceVnet =
    (getFieldValue('existing_workspace_vnet') as Record<string, unknown>) || {};

  const networkConfig =
    (existingWorkspaceVnet.network_configuration as Record<string, string>) || {};
  const dnsZoneIds =
    (existingWorkspaceVnet.dns_zone_ids as Record<string, string>) || {};

  const handleNetworkConfigChange = (val: Record<string, unknown>) => {
    setField('existing_workspace_vnet', {
      ...existingWorkspaceVnet,
      network_configuration: val,
    });
  };

  const handleDnsZoneChange = (val: Record<string, unknown>) => {
    setField('existing_workspace_vnet', {
      ...existingWorkspaceVnet,
      dns_zone_ids: val,
    });
  };

  const inputClass =
    'w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60';

  const azureResourcePlaceholder =
    '/subscriptions/.../resourceGroups/.../providers/Microsoft.Network/...';

  return (
    <div className="space-y-6">
      {/* Info box */}
      <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4">
        <div className="flex gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-error)]"
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
              BYO Spoke: Full Bring-Your-Own Network
            </p>
            <p>
              You must have already created all hub and spoke networking
              resources. Provide all Azure resource IDs below. The SRA will
              only configure the Databricks workspace on your existing
              infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* ── Hub Prerequisites (same as BYO Hub) ───────────────────────────── */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
          Hub Prerequisites
        </h4>

        {/* Metastore ID */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            Metastore ID
            <span className="ml-0.5 text-[var(--color-error)]">*</span>
          </label>
          <input
            type="text"
            value={metastoreId}
            onChange={(e) =>
              setField('databricks_metastore_id', e.target.value)
            }
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
          <ObjectInput
            value={existingHubVnet}
            onChange={(val) => setField('existing_hub_vnet', val)}
            fields={{
              route_table_id: {
                label: 'Route Table ID',
                placeholder: azureResourcePlaceholder,
                required: true,
              },
              vnet_id: {
                label: 'VNet ID',
                placeholder: azureResourcePlaceholder,
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
          <input
            type="text"
            value={existingNetworkPolicyId}
            onChange={(e) =>
              setField('existing_network_policy_id', e.target.value)
            }
            placeholder="00000000-0000-0000-0000-000000000000"
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Existing Workspace VNet ────────────────────────────────────────── */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
          Existing Workspace VNet
        </h4>

        {/* Resource Group Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            Resource Group Name
            <span className="ml-0.5 text-[var(--color-error)]">*</span>
          </label>
          <p className="text-xs text-[var(--color-text-secondary)]">
            The Azure resource group containing the workspace VNet resources.
          </p>
          <input
            type="text"
            value={existingResourceGroupName}
            onChange={(e) =>
              setField('existing_resource_group_name', e.target.value)
            }
            placeholder="rg-my-workspace"
            className={inputClass}
          />
        </div>

        {/* Group 1: Network Configuration */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            Network Configuration
            <span className="ml-0.5 text-[var(--color-error)]">*</span>
          </label>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Provide the Azure resource IDs for the workspace VNet components.
          </p>
          <ObjectInput
            value={networkConfig}
            onChange={handleNetworkConfigChange}
            fields={{
              virtual_network_id: {
                label: 'Virtual Network ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/virtualNetworks/...',
                required: true,
              },
              private_subnet_id: {
                label: 'Private Subnet ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/virtualNetworks/.../subnets/...',
                required: true,
              },
              public_subnet_id: {
                label: 'Public Subnet ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/virtualNetworks/.../subnets/...',
                required: true,
              },
              private_endpoint_subnet_id: {
                label: 'Private Endpoint Subnet ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/virtualNetworks/.../subnets/...',
                required: true,
              },
              private_subnet_network_security_group_association_id: {
                label: 'Private Subnet NSG Association ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/networkSecurityGroups/...',
                required: true,
              },
              public_subnet_network_security_group_association_id: {
                label: 'Public Subnet NSG Association ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/networkSecurityGroups/...',
                required: true,
              },
            }}
          />
        </div>

        {/* Group 2: DNS Zone IDs */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            DNS Zone IDs
            <span className="ml-0.5 text-[var(--color-error)]">*</span>
          </label>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Provide the Azure Private DNS Zone IDs for backend, DFS, and blob services.
          </p>
          <ObjectInput
            value={dnsZoneIds}
            onChange={handleDnsZoneChange}
            fields={{
              backend: {
                label: 'Backend DNS Zone ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/privateDnsZones/...',
                required: true,
              },
              dfs: {
                label: 'DFS DNS Zone ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/privateDnsZones/...',
                required: true,
              },
              blob: {
                label: 'Blob DNS Zone ID',
                placeholder:
                  '/subscriptions/.../providers/Microsoft.Network/privateDnsZones/...',
                required: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
