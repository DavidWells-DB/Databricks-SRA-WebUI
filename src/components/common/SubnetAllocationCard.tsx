import { parseCidr, numberToIp } from '../../lib/cidr/calculator';
import { isValidCidr } from '../../lib/cidr/validator';

interface SubnetAllocationCardProps {
  name: string;
  cidr: string;
  type: 'PRIVATE' | 'PRIVATELINK' | 'WORKSPACE' | 'ENDPOINT';
  color: string;
}

export default function SubnetAllocationCard({
  name,
  cidr,
  type,
  color,
}: SubnetAllocationCardProps) {
  let prefix = 0;
  let ipCount = 0;
  let rangeStart = '';
  let rangeEnd = '';

  if (isValidCidr(cidr)) {
    const parsed = parseCidr(cidr);
    prefix = parsed.prefixLength;
    ipCount = parsed.size;
    rangeStart = numberToIp(parsed.networkAddress);
    rangeEnd = numberToIp((parsed.networkAddress + parsed.size - 1) >>> 0);
  }

  const badgeStyles: Record<string, string> = {
    PRIVATE: 'bg-[#3b82f6]/15 text-[#3b82f6]',
    WORKSPACE: 'bg-[#3b82f6]/15 text-[#3b82f6]',
    PRIVATELINK: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
    ENDPOINT: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
  };
  const badgeBg = badgeStyles[type] ?? 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]';

  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all duration-200 hover:shadow-md"
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      {/* Header: name + badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {name}
        </span>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}
        >
          {type}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-tertiary)]">CIDR:</span>
          <span className="font-mono text-[var(--color-text)]">{cidr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-tertiary)]">Size:</span>
          <span className="font-mono text-[var(--color-text)]">/{prefix}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-tertiary)]">IPs:</span>
          <span className="font-mono text-[var(--color-text)]">
            {ipCount.toLocaleString()}
          </span>
        </div>
        {rangeStart && (
          <div className="flex justify-between">
            <span className="text-[var(--color-text-tertiary)]">Range:</span>
            <span className="font-mono text-[var(--color-text)] text-xs">
              {rangeStart} — {rangeEnd}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
