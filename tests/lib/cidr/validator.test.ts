import { describe, it, expect } from 'vitest';
import {
  isValidCidr,
  validateCidrRange,
  validateNoOverlap,
  validateSubnetFitsParent,
  validatePrivateRange,
} from '../../../src/lib/cidr/validator';

// ─── isValidCidr ────────────────────────────────────────────────────────────

describe('isValidCidr', () => {
  it('accepts valid CIDR notation 10.0.0.0/18', () => {
    expect(isValidCidr('10.0.0.0/18')).toBe(true);
  });

  it('accepts 0.0.0.0/0', () => {
    expect(isValidCidr('0.0.0.0/0')).toBe(true);
  });

  it('accepts 255.255.255.255/32', () => {
    expect(isValidCidr('255.255.255.255/32')).toBe(true);
  });

  it('accepts 192.168.1.0/24', () => {
    expect(isValidCidr('192.168.1.0/24')).toBe(true);
  });

  it('accepts 172.16.0.0/12', () => {
    expect(isValidCidr('172.16.0.0/12')).toBe(true);
  });

  it('rejects missing prefix', () => {
    expect(isValidCidr('10.0.0.0')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidCidr('')).toBe(false);
  });

  it('rejects non-numeric octets', () => {
    expect(isValidCidr('abc.0.0.0/24')).toBe(false);
  });

  it('rejects octets > 255', () => {
    expect(isValidCidr('256.0.0.0/24')).toBe(false);
  });

  it('rejects prefix > 32', () => {
    expect(isValidCidr('10.0.0.0/33')).toBe(false);
  });

  it('rejects negative prefix (regex won\'t match)', () => {
    expect(isValidCidr('10.0.0.0/-1')).toBe(false);
  });

  it('rejects too few octets', () => {
    expect(isValidCidr('10.0.0/24')).toBe(false);
  });

  it('rejects too many octets', () => {
    expect(isValidCidr('10.0.0.0.0/24')).toBe(false);
  });

  it('rejects spaces in CIDR', () => {
    expect(isValidCidr(' 10.0.0.0/24')).toBe(false);
    expect(isValidCidr('10.0.0.0/24 ')).toBe(false);
  });

  it('rejects double slashes', () => {
    expect(isValidCidr('10.0.0.0//24')).toBe(false);
  });
});

// ─── validateCidrRange ──────────────────────────────────────────────────────

describe('validateCidrRange', () => {
  it('returns null for prefix within range', () => {
    expect(validateCidrRange('10.0.0.0/18', 16, 24)).toBeNull();
  });

  it('returns null for prefix at min boundary', () => {
    expect(validateCidrRange('10.0.0.0/16', 16, 24)).toBeNull();
  });

  it('returns null for prefix at max boundary', () => {
    expect(validateCidrRange('10.0.0.0/24', 16, 24)).toBeNull();
  });

  it('returns error for prefix below min', () => {
    const result = validateCidrRange('10.0.0.0/8', 16, 24);
    expect(result).not.toBeNull();
    expect(result).toContain('/8');
    expect(result).toContain('outside the allowed range');
  });

  it('returns error for prefix above max', () => {
    const result = validateCidrRange('10.0.0.0/28', 16, 24);
    expect(result).not.toBeNull();
    expect(result).toContain('/28');
    expect(result).toContain('outside the allowed range');
  });

  it('returns error for invalid CIDR', () => {
    const result = validateCidrRange('not-a-cidr', 16, 24);
    expect(result).not.toBeNull();
    expect(result).toContain('not valid CIDR notation');
  });
});

// ─── validateNoOverlap ──────────────────────────────────────────────────────

describe('validateNoOverlap', () => {
  it('returns null for non-overlapping CIDRs', () => {
    expect(validateNoOverlap([
      '10.0.0.0/24',
      '10.0.1.0/24',
      '10.0.2.0/24',
    ])).toBeNull();
  });

  it('returns error naming first overlapping pair', () => {
    const result = validateNoOverlap([
      '10.0.0.0/24',
      '10.0.0.128/25',
      '10.0.2.0/24',
    ]);
    expect(result).not.toBeNull();
    expect(result).toContain('10.0.0.0/24');
    expect(result).toContain('10.0.0.128/25');
    expect(result).toContain('overlaps');
  });

  it('returns null for empty array', () => {
    expect(validateNoOverlap([])).toBeNull();
  });

  it('returns null for single CIDR', () => {
    expect(validateNoOverlap(['10.0.0.0/24'])).toBeNull();
  });

  it('detects overlap in the middle of the array', () => {
    const result = validateNoOverlap([
      '10.0.0.0/24',
      '10.0.1.0/24',
      '10.0.1.0/25', // overlaps with 10.0.1.0/24
    ]);
    expect(result).not.toBeNull();
    expect(result).toContain('10.0.1.0/24');
    expect(result).toContain('10.0.1.0/25');
  });

  it('detects identical CIDRs as overlapping', () => {
    const result = validateNoOverlap(['10.0.0.0/24', '10.0.0.0/24']);
    expect(result).not.toBeNull();
    expect(result).toContain('overlaps');
  });
});

// ─── validateSubnetFitsParent ───────────────────────────────────────────────

describe('validateSubnetFitsParent', () => {
  it('returns null when subnet fits within parent', () => {
    expect(validateSubnetFitsParent('10.0.1.0/24', '10.0.0.0/16')).toBeNull();
  });

  it('returns null when subnet equals parent', () => {
    expect(validateSubnetFitsParent('10.0.0.0/24', '10.0.0.0/24')).toBeNull();
  });

  it('returns error when subnet is outside parent', () => {
    const result = validateSubnetFitsParent('10.1.0.0/24', '10.0.0.0/16');
    expect(result).not.toBeNull();
    expect(result).toContain('does not fit within');
  });

  it('returns error when subnet is larger than parent', () => {
    const result = validateSubnetFitsParent('10.0.0.0/16', '10.0.0.0/24');
    expect(result).not.toBeNull();
    expect(result).toContain('does not fit within');
  });

  it('returns error for invalid subnet', () => {
    const result = validateSubnetFitsParent('bad', '10.0.0.0/16');
    expect(result).not.toBeNull();
    expect(result).toContain('not valid CIDR notation');
  });

  it('returns error for invalid parent', () => {
    const result = validateSubnetFitsParent('10.0.0.0/24', 'bad');
    expect(result).not.toBeNull();
    expect(result).toContain('not valid CIDR notation');
  });

  it('returns null for the SRA default private subnets within VPC', () => {
    expect(validateSubnetFitsParent('10.0.0.0/22', '10.0.0.0/18')).toBeNull();
    expect(validateSubnetFitsParent('10.0.4.0/22', '10.0.0.0/18')).toBeNull();
    expect(validateSubnetFitsParent('10.0.8.0/22', '10.0.0.0/18')).toBeNull();
  });

  it('returns null for the SRA default privatelink subnets within VPC', () => {
    expect(validateSubnetFitsParent('10.0.28.0/26', '10.0.0.0/18')).toBeNull();
    expect(validateSubnetFitsParent('10.0.28.64/26', '10.0.0.0/18')).toBeNull();
    expect(validateSubnetFitsParent('10.0.28.128/26', '10.0.0.0/18')).toBeNull();
  });
});

// ─── validatePrivateRange ───────────────────────────────────────────────────

describe('validatePrivateRange', () => {
  it('accepts 10.0.0.0/8 (class A private)', () => {
    expect(validatePrivateRange('10.0.0.0/8')).toBeNull();
  });

  it('accepts 10.0.0.0/18 (subset of class A)', () => {
    expect(validatePrivateRange('10.0.0.0/18')).toBeNull();
  });

  it('accepts 10.255.255.0/24 (end of class A)', () => {
    expect(validatePrivateRange('10.255.255.0/24')).toBeNull();
  });

  it('accepts 172.16.0.0/12 (class B private)', () => {
    expect(validatePrivateRange('172.16.0.0/12')).toBeNull();
  });

  it('accepts 172.16.0.0/24 (subset of class B)', () => {
    expect(validatePrivateRange('172.16.0.0/24')).toBeNull();
  });

  it('accepts 172.31.255.0/24 (end of class B)', () => {
    expect(validatePrivateRange('172.31.255.0/24')).toBeNull();
  });

  it('accepts 192.168.0.0/16 (class C private)', () => {
    expect(validatePrivateRange('192.168.0.0/16')).toBeNull();
  });

  it('accepts 192.168.1.0/24 (subset of class C)', () => {
    expect(validatePrivateRange('192.168.1.0/24')).toBeNull();
  });

  it('rejects public IP 8.8.8.0/24', () => {
    const result = validatePrivateRange('8.8.8.0/24');
    expect(result).not.toBeNull();
    expect(result).toContain('not within an RFC 1918 private address range');
  });

  it('rejects 172.32.0.0/24 (just outside class B)', () => {
    const result = validatePrivateRange('172.32.0.0/24');
    expect(result).not.toBeNull();
    expect(result).toContain('not within an RFC 1918 private address range');
  });

  it('rejects 192.169.0.0/24 (just outside class C)', () => {
    const result = validatePrivateRange('192.169.0.0/24');
    expect(result).not.toBeNull();
    expect(result).toContain('not within an RFC 1918 private address range');
  });

  it('rejects 11.0.0.0/8 (just outside class A)', () => {
    const result = validatePrivateRange('11.0.0.0/8');
    expect(result).not.toBeNull();
    expect(result).toContain('not within an RFC 1918 private address range');
  });

  it('rejects a range spanning across private boundary', () => {
    // 10.0.0.0/7 covers 10.0.0.0 - 11.255.255.255 (extends beyond 10.x.x.x)
    const result = validatePrivateRange('10.0.0.0/7');
    expect(result).not.toBeNull();
  });

  it('returns error for invalid CIDR', () => {
    const result = validatePrivateRange('not-valid');
    expect(result).not.toBeNull();
    expect(result).toContain('not valid CIDR notation');
  });
});
