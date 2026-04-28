import { parseCidr, numberToIp } from '../../lib/cidr/calculator';
import { isValidCidr } from '../../lib/cidr/validator';

interface SubnetEntry {
  label: string;
  cidr: string;
  color: string;
}

interface SubnetVisualizerProps {
  vpcCidr: string;
  subnets: SubnetEntry[];
}

export default function SubnetVisualizer({ vpcCidr, subnets }: SubnetVisualizerProps) {
  if (!isValidCidr(vpcCidr)) {
    return null;
  }

  const vpc = parseCidr(vpcCidr);
  const vpcStart = vpc.networkAddress;
  const vpcSize = vpc.size;

  // Filter to only valid subnets that parse correctly
  const validSubnets = subnets.filter((s) => isValidCidr(s.cidr));

  if (validSubnets.length === 0) {
    return null;
  }

  // Calculate offset and width as a percentage of the VPC for each subnet
  const segments = validSubnets.map((s) => {
    const sub = parseCidr(s.cidr);
    const offset = ((sub.networkAddress - vpcStart) >>> 0) / vpcSize;
    const width = sub.size / vpcSize;
    return {
      ...s,
      offset,
      width,
      size: sub.size,
      startIp: numberToIp(sub.networkAddress),
      endIp: numberToIp((sub.networkAddress + sub.size - 1) >>> 0),
    };
  });

  return (
    <div className="space-y-3">
      {/* VPC label */}
      <div className="text-xs font-medium text-[var(--color-text-secondary)]">
        VPC: {vpcCidr}
        <span className="ml-2 text-[var(--color-text-tertiary)]">
          ({vpcSize.toLocaleString()} IPs)
        </span>
      </div>

      {/* Visual bar */}
      <div className="relative h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-tertiary)] overflow-hidden">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="absolute top-0 h-full flex items-center justify-center overflow-hidden"
            style={{
              left: `${seg.offset * 100}%`,
              width: `${seg.width * 100}%`,
              backgroundColor: seg.color,
              borderRadius: i === 0 ? '0.375rem 0 0 0.375rem' : i === segments.length - 1 ? '0 0.375rem 0.375rem 0' : '0',
            }}
            title={`${seg.label}: ${seg.cidr}`}
          >
            {seg.width > 0.08 && (
              <span className="text-[10px] font-medium text-white truncate px-1">
                {seg.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend below the bar */}
      <div className="flex flex-wrap gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-[var(--color-text-secondary)]">
              {seg.label}
            </span>
          </div>
        ))}
      </div>

      {/* Subnet detail table */}
      <div className="overflow-x-auto rounded border border-[var(--color-border)]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-tertiary)]">
              <th className="px-3 py-2 font-medium text-[var(--color-text-secondary)]">
                Subnet
              </th>
              <th className="px-3 py-2 font-medium text-[var(--color-text-secondary)]">
                CIDR
              </th>
              <th className="px-3 py-2 font-medium text-[var(--color-text-secondary)]">
                IPs
              </th>
              <th className="px-3 py-2 font-medium text-[var(--color-text-secondary)]">
                Range
              </th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg, i) => (
              <tr
                key={i}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <td className="px-3 py-2 text-[var(--color-text)]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: seg.color }}
                    />
                    {seg.label}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-[var(--color-text)]">
                  {seg.cidr}
                </td>
                <td className="px-3 py-2 text-[var(--color-text)]">
                  {seg.size.toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono text-[var(--color-text-secondary)]">
                  {seg.startIp} - {seg.endIp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
