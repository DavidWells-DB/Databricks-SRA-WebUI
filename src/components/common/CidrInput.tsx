import { useState } from 'react';
import { isValidCidr } from '../../lib/cidr/validator';

interface CidrInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function CidrInput({
  value,
  onChange,
  error,
  placeholder = '10.0.0.0/16',
  disabled = false,
}: CidrInputProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleBlur = () => {
    if (value && !isValidCidr(value)) {
      setLocalError('Invalid CIDR notation. Expected format: x.x.x.x/y');
    } else {
      setLocalError(null);
    }
  };

  const displayError = error ?? localError;
  const isValid = !displayError && value.length > 0;

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (localError) setLocalError(null);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded border px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 ${
          displayError
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
            : isValid
              ? 'border-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-[var(--color-success)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'
        }`}
      />
      {displayError && (
        <p className="mt-1 text-sm text-[var(--color-error)]">{displayError}</p>
      )}
    </div>
  );
}
