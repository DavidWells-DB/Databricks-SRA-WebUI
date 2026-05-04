import type { SchemaVariable } from '../../schemas/types';
import ValidationMessage from './ValidationMessage';
import SensitiveInput from './SensitiveInput';
import CidrInput from './CidrInput';
import CidrListInput from './CidrListInput';
import ListEditor from './ListEditor';
import ObjectInput from './ObjectInput';
import MapEditor from './MapEditor';

interface FormFieldProps {
  variable: SchemaVariable;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
  disabled?: boolean;
}

export default function FormField({
  variable,
  value,
  error,
  onChange,
  disabled = false,
}: FormFieldProps) {
  const { name, ui, required, sensitive } = variable;
  const inputType = ui.inputType ?? 'text';

  const handleChange = (val: unknown) => onChange(name, val);
  const stringValue = value === null || value === undefined ? '' : String(value);

  const widthClass = ui.width === 'half' ? 'w-full md:w-1/2' : 'w-full';

  const hasValue = value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0);
  const isValid = required && hasValue && !error;

  const borderClass = error
    ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
    : isValid
      ? 'border-[var(--color-success)] focus:ring-[var(--color-success)]'
      : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]';

  const inputClass = `w-full rounded border ${borderClass} bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60`;

  function renderInput() {
    switch (inputType) {
      case 'select':
        return (
          <select
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className={inputClass}
          >
            <option value="">Select...</option>
            {ui.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-text)]">{ui.label}</span>
          </label>
        );

      case 'sensitive':
        return (
          <SensitiveInput
            value={stringValue}
            onChange={handleChange}
            placeholder={ui.placeholder}
            disabled={disabled}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={ui.placeholder}
            disabled={disabled}
            className={inputClass}
          />
        );

      case 'cidr':
        return (
          <CidrInput
            value={stringValue}
            onChange={handleChange}
            error={error}
            placeholder={ui.placeholder}
            disabled={disabled}
          />
        );

      case 'cidr-list':
        return (
          <CidrListInput
            value={Array.isArray(value) ? value : []}
            onChange={handleChange}
            error={error}
            disabled={disabled}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={stringValue}
            onChange={(e) =>
              handleChange(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder={ui.placeholder}
            disabled={disabled}
            className={inputClass}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={ui.placeholder}
            disabled={disabled}
            rows={4}
            className={inputClass}
          />
        );

      case 'list-editor':
        return (
          <ListEditor
            value={Array.isArray(value) ? value : []}
            onChange={handleChange}
            placeholder={ui.placeholder}
            disabled={disabled}
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {ui.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => handleChange(opt.value)}
                  disabled={disabled}
                  className="h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text)]">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'object-editor': {
        // Build fields from the terraformType definition
        const objType = variable.terraformType;
        const fields: Record<string, { label: string; placeholder?: string; required?: boolean }> = {};
        if (typeof objType === 'object' && 'object' in objType) {
          for (const [key, spec] of Object.entries(objType.object)) {
            const isOptional =
              typeof spec === 'object' && spec !== null && 'optional' in spec
                ? (spec as { optional?: boolean }).optional
                : false;
            fields[key] = {
              label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              required: !isOptional,
            };
          }
        }
        return (
          <ObjectInput
            value={typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}}
            onChange={handleChange}
            fields={fields}
            disabled={disabled}
          />
        );
      }

      case 'map-editor':
        return (
          <MapEditor
            value={typeof value === 'object' && value !== null ? (value as Record<string, string>) : {}}
            onChange={handleChange}
            disabled={disabled}
            keyOptions={ui.mapKeyOptions}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={ui.placeholder}
            disabled={disabled}
            className={inputClass}
          />
        );
    }
  }

  // Checkbox renders its own label inline
  if (inputType === 'checkbox') {
    return (
      <div className={`${widthClass} py-2`}>
        {renderInput()}
        {ui.helpText && (
          <p className="mt-1 ml-6 text-xs text-[var(--color-text-secondary)]">
            {ui.helpText}
          </p>
        )}
        <ValidationMessage message={error} />
      </div>
    );
  }

  return (
    <div className={`${widthClass} space-y-1`}>
      <label className="block text-sm font-medium text-[var(--color-text)]">
        {ui.label}
        {required && (
          <span className="ml-0.5 text-[var(--color-error)]">*</span>
        )}
        {isValid && (
          <svg className="inline-block ml-1 w-4 h-4 text-[var(--color-success)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {sensitive && (
          <span className="ml-1.5 text-xs font-normal text-[var(--color-text-tertiary)]">
            [sensitive]
          </span>
        )}
      </label>

      {ui.helpText && (
        <p className="text-xs text-[var(--color-text-secondary)]">{ui.helpText}</p>
      )}

      {renderInput()}

      {/* cidr and cidr-list show their own errors */}
      {inputType !== 'cidr' && inputType !== 'cidr-list' && (
        <ValidationMessage message={error} />
      )}
    </div>
  );
}
