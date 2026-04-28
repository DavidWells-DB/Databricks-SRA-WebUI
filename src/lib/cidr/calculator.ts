// ─── Pure CIDR calculation functions (zero React dependencies) ───────────────

/**
 * Convert a dotted-decimal IPv4 address to a 32-bit unsigned integer.
 *
 * @example ipToNumber("10.0.0.0") // 167772160
 */
export function ipToNumber(ip: string): number {
  const parts = ip.split('.');
  return (
    ((parseInt(parts[0], 10) << 24) |
      (parseInt(parts[1], 10) << 16) |
      (parseInt(parts[2], 10) << 8) |
      parseInt(parts[3], 10)) >>>
    0
  );
}

/**
 * Convert a 32-bit unsigned integer back to a dotted-decimal IPv4 string.
 *
 * @example numberToIp(167772160) // "10.0.0.0"
 */
export function numberToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.');
}

/**
 * Parse a CIDR string into its network address (as an integer), prefix length,
 * and total number of addresses in the block.
 *
 * @example parseCidr("10.0.0.0/18")
 * // { networkAddress: 167772160, prefixLength: 18, size: 16384 }
 */
export function parseCidr(cidr: string): {
  networkAddress: number;
  prefixLength: number;
  size: number;
} {
  const [ip, prefixStr] = cidr.split('/');
  const prefixLength = parseInt(prefixStr, 10);
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  const networkAddress = (ipToNumber(ip) & mask) >>> 0;
  const size = Math.pow(2, 32 - prefixLength);
  return { networkAddress, prefixLength, size };
}

/**
 * Allocate `count` non-overlapping subnets of `subnetPrefixLength` within
 * `parentCidr`, starting from the beginning of the parent range.
 *
 * @example splitSubnets("10.0.0.0/18", 22, 3)
 * // ["10.0.0.0/22", "10.0.4.0/22", "10.0.8.0/22"]
 */
export function splitSubnets(
  parentCidr: string,
  subnetPrefixLength: number,
  count: number,
): string[] {
  const parent = parseCidr(parentCidr);
  const subnetSize = Math.pow(2, 32 - subnetPrefixLength);

  if (subnetPrefixLength < parent.prefixLength) {
    throw new Error(
      `Subnet prefix /${subnetPrefixLength} is larger than parent /${parent.prefixLength}`,
    );
  }

  const maxSubnets = parent.size / subnetSize;
  if (count > maxSubnets) {
    throw new Error(
      `Cannot fit ${count} /${subnetPrefixLength} subnets in ${parentCidr} (max ${maxSubnets})`,
    );
  }

  const subnets: string[] = [];
  for (let i = 0; i < count; i++) {
    const addr = (parent.networkAddress + i * subnetSize) >>> 0;
    subnets.push(`${numberToIp(addr)}/${subnetPrefixLength}`);
  }
  return subnets;
}

/**
 * Calculate the AWS SRA isolated subnet layout for a given VPC CIDR.
 *
 * For the default "10.0.0.0/18":
 * - privateSubnets:     ["10.0.0.0/22",  "10.0.4.0/22",  "10.0.8.0/22"]
 * - privatelinkSubnets: ["10.0.28.0/26", "10.0.28.64/26", "10.0.28.128/26"]
 *
 * For other CIDR ranges the layout scales proportionally:
 * - 3 private subnets at (vpc_prefix + 4), starting at the base address
 * - 3 PrivateLink subnets at (vpc_prefix + 8), placed near the end of the range
 */
export function calculateAwsIsolatedSubnets(vpcCidr: string): {
  privateSubnets: string[];
  privatelinkSubnets: string[];
} {
  const vpc = parseCidr(vpcCidr);
  const base = vpc.networkAddress;

  // Private subnets: /(prefix+4), 3 of them starting at offset 0
  const privatePrefixLength = vpc.prefixLength + 4;
  const privateSubnetSize = Math.pow(2, 32 - privatePrefixLength);

  const privateSubnets: string[] = [];
  for (let i = 0; i < 3; i++) {
    const addr = (base + i * privateSubnetSize) >>> 0;
    privateSubnets.push(`${numberToIp(addr)}/${privatePrefixLength}`);
  }

  // PrivateLink subnets: /(prefix+8), 3 of them placed near end of range
  const plPrefixLength = vpc.prefixLength + 8;
  const plSubnetSize = Math.pow(2, 32 - plPrefixLength);

  // For a /18 VPC (size 16384), the privatelink subnets start at offset 28*256 = 7168
  // This is at 7168/16384 = 43.75% into the range.
  // Generalise: offset = floor(vpcSize * 7168 / 16384) aligned to plSubnetSize boundaries
  // Actually, for exactness: the offset for a /18 is 28 * 256 = 7168.
  // The ratio is 7168 / 16384 = 7/16.
  // For other VPC sizes: offset = vpcSize * 7 / 16, aligned down to plSubnetSize.
  const plStartOffset =
    Math.floor((vpc.size * 7) / 16 / plSubnetSize) * plSubnetSize;

  const privatelinkSubnets: string[] = [];
  for (let i = 0; i < 3; i++) {
    const addr = (base + plStartOffset + i * plSubnetSize) >>> 0;
    privatelinkSubnets.push(`${numberToIp(addr)}/${plPrefixLength}`);
  }

  return { privateSubnets, privatelinkSubnets };
}

/**
 * Calculate AWS SRA subnet layout with configurable mask prefixes.
 *
 * Private (workspace) subnets are placed at the start of the VPC.
 * PrivateLink (endpoint) subnets are placed immediately AFTER the private
 * subnets. This guarantees no overlap.
 *
 * Returns null if the subnets don't fit in the VPC.
 *
 * @param vpcCidr       The VPC CIDR (e.g. "10.0.0.0/18")
 * @param privatePrefix Prefix length for private subnets (e.g. 22)
 * @param plPrefix      Prefix length for PrivateLink subnets (e.g. 26)
 * @param count         Number of subnets per type (default 3)
 */
export function calculateAwsSubnetsWithMask(
  vpcCidr: string,
  privatePrefix: number,
  plPrefix: number,
  count = 3,
): { privateSubnets: string[]; privatelinkSubnets: string[]; fits: boolean } {
  const vpc = parseCidr(vpcCidr);
  const base = vpc.networkAddress;

  const privateSubnetSize = Math.pow(2, 32 - privatePrefix);
  const plSubnetSize = Math.pow(2, 32 - plPrefix);
  const totalNeeded = count * privateSubnetSize + count * plSubnetSize;
  const fits = totalNeeded <= vpc.size;

  // Private subnets: start of VPC
  const privateSubnets: string[] = [];
  for (let i = 0; i < count; i++) {
    const addr = (base + i * privateSubnetSize) >>> 0;
    privateSubnets.push(`${numberToIp(addr)}/${privatePrefix}`);
  }

  // PrivateLink subnets: immediately after private subnets,
  // aligned to PL subnet size boundary
  const privateEnd = count * privateSubnetSize;
  const plAlignedStart =
    Math.ceil(privateEnd / plSubnetSize) * plSubnetSize;

  const privatelinkSubnets: string[] = [];
  for (let i = 0; i < count; i++) {
    const addr = (base + plAlignedStart + i * plSubnetSize) >>> 0;
    privatelinkSubnets.push(`${numberToIp(addr)}/${plPrefix}`);
  }

  return { privateSubnets, privatelinkSubnets, fits };
}

/**
 * Check whether two CIDR ranges overlap (share any addresses).
 */
export function subnetsOverlap(a: string, b: string): boolean {
  const pa = parseCidr(a);
  const pb = parseCidr(b);

  const aStart = pa.networkAddress;
  const aEnd = (aStart + pa.size - 1) >>> 0;
  const bStart = pb.networkAddress;
  const bEnd = (bStart + pb.size - 1) >>> 0;

  return aStart <= bEnd && bStart <= aEnd;
}

/**
 * Check whether `child` CIDR falls entirely within `parent` CIDR.
 */
export function isSubnetOf(child: string, parent: string): boolean {
  const pc = parseCidr(child);
  const pp = parseCidr(parent);

  const childStart = pc.networkAddress;
  const childEnd = (childStart + pc.size - 1) >>> 0;
  const parentStart = pp.networkAddress;
  const parentEnd = (parentStart + pp.size - 1) >>> 0;

  return childStart >= parentStart && childEnd <= parentEnd;
}
