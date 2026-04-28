import { useConfig } from '../../../context/ConfigContext';
import { gcpSchema } from '../../../schemas/gcp/variables';
import FormField from '../../common/FormField';
import ConditionalSection from '../../common/ConditionalSection';

interface GCPPscSectionProps {
  showExistingPscEp?: boolean;
}

/** PSC field names in display order */
const PSC_FIELDS = [
  'google_pe_subnet',
  'google_pe_subnet_ip_cidr_range',
  'workspace_pe',
  'relay_pe',
  'workspace_pe_ip_name',
  'relay_pe_ip_name',
  'workspace_service_attachment',
  'relay_service_attachment',
];

export default function GCPPscSection({ showExistingPscEp = false }: GCPPscSectionProps) {
  const { state, getFieldValue, setField } = useConfig();

  const usePscVar = gcpSchema.variables.find((v) => v.name === 'use_psc');
  const existingPscEpVar = gcpSchema.variables.find((v) => v.name === 'use_existing_PSC_EP');

  const pscFieldVars = PSC_FIELDS
    .map((name) => gcpSchema.variables.find((v) => v.name === name))
    .filter((v): v is NonNullable<typeof v> => v !== undefined);

  return (
    <div className="space-y-4">
      {/* PSC toggle */}
      {usePscVar && (
        <FormField
          variable={usePscVar}
          value={getFieldValue('use_psc')}
          onChange={setField}
        />
      )}

      {/* PSC-dependent fields */}
      <ConditionalSection
        conditions={[{ field: 'use_psc', operator: 'eq', value: true }]}
        values={state.values}
      >
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4 space-y-4">
          <h4 className="text-sm font-semibold text-[var(--color-text)]">
            Private Service Connect Configuration
          </h4>

          {pscFieldVars.map((variable) => (
            <FormField
              key={variable.name}
              variable={variable}
              value={getFieldValue(variable.name)}
              onChange={setField}
            />
          ))}

          {/* use_existing_PSC_EP -- only for existing-vpc mode */}
          {showExistingPscEp && existingPscEpVar && (
            <FormField
              variable={existingPscEpVar}
              value={getFieldValue('use_existing_PSC_EP')}
              onChange={setField}
            />
          )}
        </div>
      </ConditionalSection>
    </div>
  );
}
