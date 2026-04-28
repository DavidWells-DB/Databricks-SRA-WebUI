import { parseCidr, subnetsOverlap } from './calculator';

// ─── CIDR validation helpers ─────────────────────────────────────────────────

/**
 * Check whether a string is valid CIDR notation (x.x.x.x/y where y is 0-32
 * and each octet is 0-255). The IP must also be the true network address for
 * the given prefix (no host bits set).
 */
export function isValidCidr(value: string): boolean {
  const match = value.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/,
  );
  if (!match) return false;

  const octets = [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10),
    parseInt(match[4], 10),
  ];
  const prefix = parseInt(match[5], 10);

  // Each octet must be 0-255
  if (octets.some((o) => o < 0 || o > 255)) return false;
  // Prefix must be 0-32
  if (prefix < 0 || prefix > 32) return false;

  return true;
}

/**
 * Returns an error message if the CIDR's prefix length is outside the allowed
 * range [minPrefix, maxPrefix], or `null` if valid.
 */
export function validateCidrRange(
  value: string,
  minPrefix: number,
  maxPrefix: number,
): string | null {
  if (!isValidCidr(value)) {
    return `"${value}" is not valid CIDR notation`;
  }

  const { prefixLength } = parseCidr(value);

  if (prefixLength < minPrefix || prefixLength > maxPrefix) {
    return `Prefix length /${prefixLength} is outside the allowed range /${minPrefix}-/${maxPrefix}`;
  }

  return null;
}

/**
 * Returns an error message naming the first pair of overlapping CIDRs in the
 * given array, or `null` if there are no overlaps.
 */
export function validateNoOverlap(cidrs: string[]): string | null {
  for (let i = 0; i < cidrs.length; i++) {
    for (let j = i + 1; j < cidrs.length; j++) {
      if (subnetsOverlap(cidrs[i], cidrs[j])) {
        return `${cidrs[i]} overlaps with ${cidrs[j]}`;
      }
    }
  }
  return null;
}

/**
 * Returns an error message if the subnet does not fit entirely within the
 * parent CIDR, or `null` if it does.
 */
export function validateSubnetFitsParent(
  subnet: string,
  parent: string,
): string | null {
  if (!isValidCidr(subnet)) {
    return `"${subnet}" is not valid CIDR notation`;
  }
  if (!isValidCidr(parent)) {
    return `"${parent}" is not valid CIDR notation`;
  }

  const ps = parseCidr(subnet);
  const pp = parseCidr(parent);

  const subnetStart = ps.networkAddress;
  const subnetEnd = (subnetStart + ps.size - 1) >>> 0;
  const parentStart = pp.networkAddress;
  const parentEnd = (parentStart + pp.size - 1) >>> 0;

  if (subnetStart < parentStart || subnetEnd > parentEnd) {
    return `${subnet} does not fit within ${parent}`;
  }

  return null;
}

/**
 * Returns an error message if the CIDR is not within an RFC 1918 private
 * address range, or `null` if it is.
 *
 * Private ranges:
 *   10.0.0.0/8      (10.0.0.0    – 10.255.255.255)
 *   172.16.0.0/12   (172.16.0.0  – 172.31.255.255)
 *   192.168.0.0/16  (192.168.0.0 – 192.168.255.255)
 */
export function validatePrivateRange(value: string): string | null {
  if (!isValidCidr(value)) {
    return `"${value}" is not valid CIDR notation`;
  }

  const { networkAddress, size } = parseCidr(value);
  const start = networkAddress;
  const end = (start + size - 1) >>> 0;

  // 10.0.0.0/8
  const rfc1918_10_start = 0x0a000000 >>> 0; // 10.0.0.0
  const rfc1918_10_end = 0x0affffff >>> 0; // 10.255.255.255

  // 172.16.0.0/12
  const rfc1918_172_start = 0xac100000 >>> 0; // 172.16.0.0
  const rfc1918_172_end = 0xac1fffff >>> 0; // 172.31.255.255

  // 192.168.0.0/16
  const rfc1918_192_start = 0xc0a80000 >>> 0; // 192.168.0.0
  const rfc1918_192_end = 0xc0a8ffff >>> 0; // 192.168.255.255

  const fitsIn = (rangeStart: number, rangeEnd: number) =>
    start >= rangeStart && end <= rangeEnd;

  if (
    fitsIn(rfc1918_10_start, rfc1918_10_end) ||
    fitsIn(rfc1918_172_start, rfc1918_172_end) ||
    fitsIn(rfc1918_192_start, rfc1918_192_end)
  ) {
    return null;
  }

  return `${value} is not within an RFC 1918 private address range (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)`;
}
