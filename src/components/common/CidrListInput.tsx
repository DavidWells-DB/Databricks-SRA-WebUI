import { isValidCidr } from '../../lib/cidr/validator';

interface CidrListInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export default function CidrListInput({
  value,
  onChange,
  error,
  disabled = false,
}: CidrListInputProps) {
  const handleItemChange = (index: number, newValue: string) => {
    const next = [...value];
    next[index] = newValue;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...value, '']);
  };

  return (
    <div className="space-y-2">
      {value.map((cidr, index) => {
        const invalid = cidr !== '' && !isValidCidr(cidr);
        return (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={cidr}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder="10.0.0.0/16"
              disabled={disabled}
              className={`flex-1 rounded border px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 ${
                invalid
                  ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
                  : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'
              }`}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Remove CIDR block"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded border border-dashed border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
        Add CIDR block
      </button>

      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
