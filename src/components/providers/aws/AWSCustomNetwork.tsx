import { useConfig } from '../../../context/ConfigContext';
import { awsSchema } from '../../../schemas/aws/variables';
import FormField from '../../common/FormField';

function getVariable(name: string) {
  return awsSchema.variables.find((v) => v.name === name);
}

const CUSTOM_FIELD_NAMES = [
  'custom_vpc_id',
  'custom_private_subnet_ids',
  'custom_sg_id',
  'custom_relay_vpce_id',
  'custom_workspace_vpce_id',
] as const;

export default function AWSCustomNetwork() {
  const { setField, getFieldValue, state } = useConfig();

  return (
    <div className="space-y-6">
      {/* Info box */}
      <div className="rounded-lg border border-[var(--color-info,var(--color-primary))]/30 bg-[var(--color-info,var(--color-primary))]/5 p-4">
        <div className="flex gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-info,var(--color-primary))]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Ensure STS, Kinesis, and S3 endpoints are available in your VPC and
            associated with the private subnet route tables. Private DNS must be
            enabled for Databricks PrivateLink endpoints.
          </p>
        </div>
      </div>

      {/* Custom network fields */}
      <div className="flex flex-wrap gap-x-4 gap-y-5">
        {CUSTOM_FIELD_NAMES.map((name) => {
          const variable = getVariable(name);
          if (!variable) return null;

          return (
            <FormField
              key={name}
              variable={variable}
              value={getFieldValue(name)}
              error={state.errors[name]}
              onChange={setField}
            />
          );
        })}
      </div>
    </div>
  );
}
