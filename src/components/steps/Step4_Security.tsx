import { useConfig } from '../../context/useConfig';
import { awsSchema } from '../../schemas/aws/variables';
import { azureSchema } from '../../schemas/azure/variables';
import { gcpSchema } from '../../schemas/gcp/variables';
import type { SchemaVariable } from '../../schemas/types';
import FormField from '../common/FormField';
import ConditionalSection from '../common/ConditionalSection';
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

// ─── Component ─────────────────────────────────────────────────────────────

export default function Step4_Security() {
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

  const sectionCard =
    'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4';
  const sectionTitle = 'text-base font-semibold text-[var(--color-text)]';

  const hasSecurityVars = (schema?.variables ?? []).some(
    (sv) => sv.ui.group === 'security',
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Security &amp; Encryption
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Configure customer-managed keys and encryption settings.
        </p>
      </div>

      {!hasSecurityVars ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-6 text-center text-[var(--color-text-secondary)]">
          No security configuration available for this provider.
        </div>
      ) : (
        <>
          {/* ── AWS: CMK Configuration ──────────────────────────────────────── */}
          {provider === 'aws' && (
            <div className={sectionCard}>
              <h3 className={sectionTitle}>Customer-Managed Keys</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Optionally specify an IAM principal to administer the CMK. If not set, the deploying principal is used.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rf('cmk_admin_arn')}
              </div>
            </div>
          )}

          {/* ── Azure: CMK Configuration ───────────────────────────────────── */}
          {provider === 'azure' && (
            <div className={sectionCard}>
              <h3 className={sectionTitle}>Customer-Managed Keys</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Enable encryption with customer-managed keys for managed disks and services.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rf('cmk_enabled')}
                {rf('existing_cmk_ids')}
              </div>
            </div>
          )}

          {/* ── GCP: CMEK Configuration ────────────────────────────────────── */}
          {provider === 'gcp' && (
            <div className={sectionCard}>
              <h3 className={sectionTitle}>Customer-Managed Encryption Keys (CMEK)</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Use an existing Cloud KMS key for workspace encryption, or let SRA create one.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rf('use_existing_cmek')}
                {rf('key_name')}
                {rf('keyring_name')}
                {rf('cmek_resource_id')}
              </div>
            </div>
          )}
        </>
      )}

      <WizardNavigation
        backPath="/configure/network"
        continuePath="/configure/advanced"
        onContinue={() => completeStep('security')}
      />
    </div>
  );
}
