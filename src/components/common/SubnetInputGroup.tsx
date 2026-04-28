import { useState } from 'react';

interface SubnetInputGroupProps {
  label: string;
  value: string;
  onChange: (cidr: string) => void;
  mask: number;
  disabled?: boolean;
  color?: string;
}

export default function SubnetInputGroup({
  label,
  value,
  onChange,
  mask,
  disabled = false,
  color,
}: SubnetInputGroupProps) {
  // Extract the IP portion from the CIDR value
  const parentIp = value.includes('/') ? value.split('/')[0] : value;
  const [localIp, setLocalIp] = useState(parentIp);

  // Keep localIp in sync when the parent value changes externally
  if (parentIp !== localIp) {
    setLocalIp(parentIp);
  }

  const handleIpChange = (newIp: string) => {
    setLocalIp(newIp);
    onChange(`${newIp}/${mask}`);
  };

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
        {color && (
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={localIp}
          onChange={(e) => handleIpChange(e.target.value)}
          disabled={disabled}
          className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="10.0.0.0"
        />
        <span className="text-sm font-mono text-[var(--color-text-secondary)]">
          /{mask}
        </span>
      </div>
    </div>
  );
}
