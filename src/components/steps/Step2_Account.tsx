import { useConfig } from '../../context/ConfigContext';
import { awsSchema } from '../../schemas/aws/variables';
import { azureSchema } from '../../schemas/azure/variables';
import { gcpSchema } from '../../schemas/gcp/variables';
import type { SchemaVariable } from '../../schemas/types';
import FormField from '../common/FormField';
import ConditionalSection from '../common/ConditionalSection';
import WizardNavigation from './WizardNavigation';

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Look up a variable by name from the schema */
function findVar(vars: SchemaVariable[], name: string): SchemaVariable | undefined {
  return vars.find((v) => v.name === name);
}

/** Render a FormField (optionally wrapped in ConditionalSection) inside a grid-aware div */
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

// ─── Component ─────────────────────────────────────────────────────────────

export default function Step2_Account() {
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
  const v = (name: string) => findVar(vars, name);
  const rf = (name: string) =>
    renderField(v(name), getFieldValue, setField, state.values);

  // ── Section card style ─────────────────────────────────────────────────────
  const sectionCard =
    'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4';
  const sectionTitle = 'text-base font-semibold text-[var(--color-text)]';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Account &amp; Identity
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Configure your cloud account and Databricks credentials.
        </p>
      </div>

      {/* ── Cloud Provider Account ──────────────────────────────────────────── */}
      <div className={sectionCard}>
        <h3 className={sectionTitle}>Cloud Provider Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {provider === 'aws' && (
            <>
              {rf('aws_account_id')}
              {rf('region')}
            </>
          )}
          {provider === 'azure' && (
            <>
              {rf('subscription_id')}
              {rf('location')}
            </>
          )}
          {provider === 'gcp' && (
            <>
              {rf('google_project')}
              {rf('google_region')}
            </>
          )}
        </div>
      </div>

      {/* ── Databricks Configuration ───────────────────────────────────────── */}
      <div className={sectionCard}>
        <h3 className={sectionTitle}>Databricks Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rf('databricks_account_id')}
          {provider === 'aws' && rf('admin_user')}
          {provider === 'gcp' && (
            <>
              {rf('databricks_google_service_account')}
              {rf('admin_user_email')}
            </>
          )}
        </div>
      </div>

      {/* ── Resource Naming ─────────────────────────────────────────────────── */}
      <div className={sectionCard}>
        <h3 className={sectionTitle}>Resource Naming</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {provider === 'aws' && rf('resource_prefix')}
          {provider === 'azure' && rf('resource_suffix')}
          {provider === 'gcp' && rf('workspace_name')}
        </div>
      </div>

      {/* ── GovCloud (AWS only, conditional) ────────────────────────────────── */}
      {provider === 'aws' && (
        <ConditionalSection
          conditions={[{ field: 'region', operator: 'eq', value: 'us-gov-west-1' }]}
          values={state.values}
        >
          <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-5 space-y-4">
            <h3 className={sectionTitle}>GovCloud Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rf('databricks_gov_shard')}
            </div>
          </div>
        </ConditionalSection>
      )}

      <WizardNavigation
        backPath="/configure"
        continuePath="/configure/network"
        onContinue={() => completeStep('account')}
      />
    </div>
  );
}
