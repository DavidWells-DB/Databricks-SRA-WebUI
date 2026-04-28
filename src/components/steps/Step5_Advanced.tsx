import { useConfig } from '../../context/ConfigContext';
import { awsSchema } from '../../schemas/aws/variables';
import { azureSchema } from '../../schemas/azure/variables';
import { gcpSchema } from '../../schemas/gcp/variables';
import type { SchemaVariable } from '../../schemas/types';
import FormField from '../common/FormField';
import ConditionalSection from '../common/ConditionalSection';
import CollapsibleSection from '../common/CollapsibleSection';
import WizardNavigation from './WizardNavigation';

// ─── Helpers ───────────────────────────────────────────────────────────────

function findVar(vars: SchemaVariable[], name: string): SchemaVariable | undefined {
  return vars.find((v) => v.name === name);
}

function renderField(
  variable: SchemaVariable | undefined,
  getFieldValue: (name: string) => unknown,
  setField: (name: string, value: unknown) => void,
  values: Record<string, unknown>,
) {
  if (!variable) return null;

  const spanClass = variable.ui.width === 'half' ? '' : 'md:col-span-2';

  const field = (
    <FormField
      key={variable.name}
      variable={variable}
      value={getFieldValue(variable.name)}
      onChange={setField}
    />
  );

  const wrapped = variable.ui.visibleWhen ? (
    <ConditionalSection
      key={variable.name}
      conditions={variable.ui.visibleWhen}
      values={values}
    >
      {field}
    </ConditionalSection>
  ) : (
    field
  );

  return (
    <div key={variable.name} className={spanClass}>
      {wrapped}
    </div>
  );
}

/** Return true if at least one of the named variables exists in the schema */
function hasAny(vars: SchemaVariable[], names: string[]): boolean {
  return names.some((n) => vars.find((v) => v.name === n));
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Step5_Advanced() {
  const { state, getFieldValue, setField, completeStep } = useConfig();
  const { provider } = state;

  const schema =
    provider === 'aws'
      ? awsSchema
      : provider === 'azure'
        ? azureSchema
        : provider === 'gcp'
          ? gcpSchema
          : null;

  const vars = schema?.variables ?? [];
  const rf = (name: string) =>
    renderField(findVar(vars, name), getFieldValue, setField, state.values);

  // ── Feature Flags ─────────────────────────────────────────────────────────
  const featureFlagNames = [
    'metastore_exists',
    'audit_log_delivery_exists',
    'enable_security_analysis_tool',
    'provision_regional_metastore',
    'regional_metastore_id',
  ];

  // ── Compliance ────────────────────────────────────────────────────────────
  const complianceNames = [
    'enable_compliance_security_profile',
    'compliance_standards',
    'workspace_security_compliance',
  ];

  // ── SAT Configuration ─────────────────────────────────────────────────────
  const satNames = ['sat_configuration', 'sat_service_principal'];

  // ── Network Egress (Azure only) ───────────────────────────────────────────
  const networkEgressNames = ['allowed_fqdns', 'hub_allowed_urls'];

  // ── Tags & Naming ─────────────────────────────────────────────────────────
  const tagsNamingNames = [
    'tags',
    'workspace_name_overrides',
    'deployment_name',
    'create_workspace_resource_group',
    'existing_resource_group_name',
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Advanced Configuration
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Optional settings for metastore, compliance, and deployment customisation.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          All fields on this page are optional. Defaults match the SRA recommended configuration.
        </p>
      </div>

      {/* ── Feature Flags ──────────────────────────────────────────────────── */}
      {hasAny(vars, featureFlagNames) && (
        <CollapsibleSection title="Feature Flags" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureFlagNames.map((name) => rf(name))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Compliance ─────────────────────────────────────────────────────── */}
      {hasAny(vars, complianceNames) && (
        <CollapsibleSection title="Compliance" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceNames.map((name) => rf(name))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── SAT Configuration ──────────────────────────────────────────────── */}
      {hasAny(vars, satNames) && (
        <CollapsibleSection title="SAT Configuration" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {satNames.map((name) => rf(name))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Network Egress (Azure only) ────────────────────────────────────── */}
      {provider === 'azure' && hasAny(vars, networkEgressNames) && (
        <CollapsibleSection title="Network Egress" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {networkEgressNames.map((name) => rf(name))}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Tags & Naming ──────────────────────────────────────────────────── */}
      {hasAny(vars, tagsNamingNames) && (
        <CollapsibleSection title="Tags &amp; Naming" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tagsNamingNames.map((name) => rf(name))}
          </div>
        </CollapsibleSection>
      )}

      <WizardNavigation
        backPath="/configure/security"
        continuePath="/configure/review"
        onContinue={() => completeStep('advanced')}
      />
    </div>
  );
}
