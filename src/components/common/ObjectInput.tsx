interface ObjectInputProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  fields: Record<string, { label: string; placeholder?: string; required?: boolean }>;
  disabled?: boolean;
}

export default function ObjectInput({
  value,
  onChange,
  fields,
  disabled = false,
}: ObjectInputProps) {
  const handleFieldChange = (fieldName: string, fieldValue: string) => {
    onChange({ ...value, [fieldName]: fieldValue });
  };

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4 space-y-3">
      {Object.entries(fields).map(([fieldName, fieldDef]) => (
        <div key={fieldName}>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
            {fieldDef.label}
            {fieldDef.required && (
              <span className="ml-0.5 text-[var(--color-error)]">*</span>
            )}
          </label>
          <input
            type="text"
            value={value[fieldName] === null || value[fieldName] === undefined ? '' : String(value[fieldName])}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={fieldDef.placeholder}
            disabled={disabled}
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      ))}
    </div>
  );
}
