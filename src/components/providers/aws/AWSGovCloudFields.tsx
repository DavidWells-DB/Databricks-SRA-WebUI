import { useConfig } from '../../../context/ConfigContext';
import { awsSchema } from '../../../schemas/aws/variables';

function getVariable(name: string) {
  return awsSchema.variables.find((v) => v.name === name);
}

export default function AWSGovCloudFields() {
  const { setField, getFieldValue } = useConfig();

  const variable = getVariable('databricks_gov_shard');
  if (!variable) return null;

  const value = getFieldValue('databricks_gov_shard') as string | undefined;
  const options = variable.ui.options ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--color-text)]">
          {variable.ui.label}
        </label>
        {variable.ui.helpText && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            {variable.ui.helpText}
          </p>
        )}

        <div className="space-y-2 pt-1">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="databricks_gov_shard"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => setField('databricks_gov_shard', opt.value)}
                className="h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-text)]">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Info text */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] p-3">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          The GovCloud shard determines which Databricks control plane your
          workspace connects to.{' '}
          <strong className="text-[var(--color-text)]">Civilian</strong> is the
          standard FedRAMP High environment.{' '}
          <strong className="text-[var(--color-text)]">DoD</strong> is the
          IL5-authorized environment for Department of Defense workloads. This
          setting only applies when the region is{' '}
          <span className="font-mono">us-gov-west-1</span>.
        </p>
      </div>
    </div>
  );
}
