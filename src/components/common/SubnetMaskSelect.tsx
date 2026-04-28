interface SubnetMaskSelectProps {
  value: number;
  onChange: (mask: number) => void;
  minPrefix: number;
  maxPrefix?: number;
  label?: string;
  helpText?: string;
}

export default function SubnetMaskSelect({
  value,
  onChange,
  minPrefix,
  maxPrefix = 30,
  label,
  helpText,
}: SubnetMaskSelectProps) {
  const options: number[] = [];
  for (let i = minPrefix; i <= maxPrefix; i++) {
    options.push(i);
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}
      {helpText && (
        <p className="text-xs text-[var(--color-text-secondary)]">{helpText}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-mono text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
      >
        {options.map((prefix) => (
          <option key={prefix} value={prefix}>
            /{prefix} ({Math.pow(2, 32 - prefix).toLocaleString()} IPs)
          </option>
        ))}
      </select>
    </div>
  );
}
