interface SubnetSizeSliderProps {
  value: number;
  onChange: (prefix: number) => void;
  minPrefix: number;
  maxPrefix: number;
  label?: string;
}

function ips(prefix: number): number {
  return Math.pow(2, 32 - prefix);
}

function fmtIps(n: number): string {
  return n.toLocaleString();
}

export default function SubnetSizeSlider({
  value,
  onChange,
  minPrefix,
  maxPrefix,
  label = 'Subnet Size',
}: SubnetSizeSliderProps) {
  const currentIps = ips(value);
  const maxNodes = Math.floor(currentIps * 0.48);

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-[var(--color-text)]">
          {label}
        </label>
      )}

      {/* Slider with min/max labels */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-mono">
          <span>/{minPrefix} ({fmtIps(ips(minPrefix))} IPs)</span>
          <span>/{maxPrefix} ({fmtIps(ips(maxPrefix))} IPs)</span>
        </div>
        <input
          type="range"
          min={minPrefix}
          max={maxPrefix}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="subnet-slider w-full"
        />
      </div>

      {/* Stats readout */}
      <div className="grid grid-cols-3 gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-3">
        <div className="text-center">
          <div className="text-xl font-bold font-mono text-[var(--color-primary)]">
            /{value}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Subnet Prefix
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold font-mono text-[var(--color-text)]">
            {fmtIps(currentIps)}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            IPs per Subnet
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold font-mono text-[var(--color-text)]">
            ~{fmtIps(maxNodes)}
          </div>
          <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Max Nodes
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)]">
        Adjust the subnet size based on your expected cluster size. Larger subnets support more concurrent nodes.
      </p>
    </div>
  );
}
