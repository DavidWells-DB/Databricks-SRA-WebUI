import { describe, it, expect } from 'vitest';
import {
  ipToNumber,
  numberToIp,
  parseCidr,
  splitSubnets,
  calculateAwsIsolatedSubnets,
  subnetsOverlap,
  isSubnetOf,
} from '../../../src/lib/cidr/calculator';

// ─── ipToNumber ─────────────────────────────────────────────────────────────

describe('ipToNumber', () => {
  it('converts 0.0.0.0 to 0', () => {
    expect(ipToNumber('0.0.0.0')).toBe(0);
  });

  it('converts 10.0.0.0 to 167772160', () => {
    expect(ipToNumber('10.0.0.0')).toBe(167772160);
  });

  it('converts 255.255.255.255 to 4294967295', () => {
    expect(ipToNumber('255.255.255.255')).toBe(4294967295);
  });

  it('converts 192.168.1.1 correctly', () => {
    // 192*2^24 + 168*2^16 + 1*2^8 + 1 = 3232235777
    expect(ipToNumber('192.168.1.1')).toBe(3232235777);
  });

  it('converts 172.16.0.0 correctly', () => {
    // 172*2^24 + 16*2^16 = 2886729728
    expect(ipToNumber('172.16.0.0')).toBe(2886729728);
  });

  it('converts 0.0.0.1 to 1', () => {
    expect(ipToNumber('0.0.0.1')).toBe(1);
  });

  it('converts 0.0.1.0 to 256', () => {
    expect(ipToNumber('0.0.1.0')).toBe(256);
  });

  it('converts 128.0.0.0 correctly', () => {
    expect(ipToNumber('128.0.0.0')).toBe(2147483648);
  });
});

// ─── numberToIp ─────────────────────────────────────────────────────────────

describe('numberToIp', () => {
  it('converts 0 to 0.0.0.0', () => {
    expect(numberToIp(0)).toBe('0.0.0.0');
  });

  it('converts 4294967295 to 255.255.255.255', () => {
    expect(numberToIp(4294967295)).toBe('255.255.255.255');
  });

  it('converts 167772160 to 10.0.0.0', () => {
    expect(numberToIp(167772160)).toBe('10.0.0.0');
  });

  it('round-trips with ipToNumber for various IPs', () => {
    const ips = [
      '0.0.0.0',
      '10.0.0.0',
      '10.0.4.0',
      '10.0.28.128',
      '172.16.0.0',
      '192.168.1.1',
      '255.255.255.255',
      '128.0.0.0',
      '1.2.3.4',
    ];
    for (const ip of ips) {
      expect(numberToIp(ipToNumber(ip))).toBe(ip);
    }
  });
});

// ─── parseCidr ──────────────────────────────────────────────────────────────

describe('parseCidr', () => {
  it('parses 10.0.0.0/18', () => {
    const result = parseCidr('10.0.0.0/18');
    expect(result.networkAddress).toBe(ipToNumber('10.0.0.0'));
    expect(result.prefixLength).toBe(18);
    expect(result.size).toBe(16384); // 2^14
  });

  it('parses 0.0.0.0/0 (entire IPv4 space)', () => {
    const result = parseCidr('0.0.0.0/0');
    expect(result.networkAddress).toBe(0);
    expect(result.prefixLength).toBe(0);
    expect(result.size).toBe(4294967296); // 2^32
  });

  it('parses 192.168.1.1/32 (single host)', () => {
    const result = parseCidr('192.168.1.1/32');
    expect(result.networkAddress).toBe(ipToNumber('192.168.1.1'));
    expect(result.prefixLength).toBe(32);
    expect(result.size).toBe(1);
  });

  it('parses 10.0.0.0/24', () => {
    const result = parseCidr('10.0.0.0/24');
    expect(result.networkAddress).toBe(ipToNumber('10.0.0.0'));
    expect(result.prefixLength).toBe(24);
    expect(result.size).toBe(256); // 2^8
  });

  it('parses 10.0.0.0/16', () => {
    const result = parseCidr('10.0.0.0/16');
    expect(result.networkAddress).toBe(ipToNumber('10.0.0.0'));
    expect(result.prefixLength).toBe(16);
    expect(result.size).toBe(65536); // 2^16
  });

  it('parses 10.0.0.0/8', () => {
    const result = parseCidr('10.0.0.0/8');
    expect(result.networkAddress).toBe(ipToNumber('10.0.0.0'));
    expect(result.prefixLength).toBe(8);
    expect(result.size).toBe(16777216); // 2^24
  });

  it('masks host bits from the IP when parsing', () => {
    // 10.0.0.5/24 should have networkAddress = 10.0.0.0
    const result = parseCidr('10.0.0.5/24');
    expect(result.networkAddress).toBe(ipToNumber('10.0.0.0'));
    expect(result.prefixLength).toBe(24);
  });

  it('parses 172.16.0.0/12', () => {
    const result = parseCidr('172.16.0.0/12');
    expect(result.networkAddress).toBe(ipToNumber('172.16.0.0'));
    expect(result.prefixLength).toBe(12);
    expect(result.size).toBe(1048576); // 2^20
  });
});

// ─── splitSubnets ───────────────────────────────────────────────────────────

describe('splitSubnets', () => {
  it('splits 10.0.0.0/18 into 3 /22 subnets', () => {
    const result = splitSubnets('10.0.0.0/18', 22, 3);
    expect(result).toEqual([
      '10.0.0.0/22',
      '10.0.4.0/22',
      '10.0.8.0/22',
    ]);
  });

  it('splits 10.0.0.0/24 into 4 /26 subnets', () => {
    const result = splitSubnets('10.0.0.0/24', 26, 4);
    expect(result).toEqual([
      '10.0.0.0/26',
      '10.0.0.64/26',
      '10.0.0.128/26',
      '10.0.0.192/26',
    ]);
  });

  it('splits 10.0.0.0/16 into 2 /17 subnets', () => {
    const result = splitSubnets('10.0.0.0/16', 17, 2);
    expect(result).toEqual([
      '10.0.0.0/17',
      '10.0.128.0/17',
    ]);
  });

  it('returns a single subnet when count is 1', () => {
    const result = splitSubnets('10.0.0.0/24', 24, 1);
    expect(result).toEqual(['10.0.0.0/24']);
  });

  it('throws when subnet prefix is larger than parent', () => {
    expect(() => splitSubnets('10.0.0.0/24', 16, 1)).toThrow(
      'Subnet prefix /16 is larger than parent /24',
    );
  });

  it('throws when count exceeds max subnets', () => {
    // /24 has 256 addresses, /26 has 64 each, max 4 subnets
    expect(() => splitSubnets('10.0.0.0/24', 26, 5)).toThrow(
      'Cannot fit 5 /26 subnets in 10.0.0.0/24 (max 4)',
    );
  });

  it('returns empty array when count is 0', () => {
    const result = splitSubnets('10.0.0.0/24', 26, 0);
    expect(result).toEqual([]);
  });
});

// ─── calculateAwsIsolatedSubnets ────────────────────────────────────────────

describe('calculateAwsIsolatedSubnets', () => {
  it('calculates correct subnets for 10.0.0.0/18 (the default VPC CIDR)', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/18');
    expect(result.privateSubnets).toEqual([
      '10.0.0.0/22',
      '10.0.4.0/22',
      '10.0.8.0/22',
    ]);
    expect(result.privatelinkSubnets).toEqual([
      '10.0.28.0/26',
      '10.0.28.64/26',
      '10.0.28.128/26',
    ]);
  });

  it('produces 3 private subnets and 3 privatelink subnets', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/18');
    expect(result.privateSubnets).toHaveLength(3);
    expect(result.privatelinkSubnets).toHaveLength(3);
  });

  it('private subnets have prefix = VPC prefix + 4', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/18');
    for (const subnet of result.privateSubnets) {
      const { prefixLength } = parseCidr(subnet);
      expect(prefixLength).toBe(22); // 18 + 4
    }
  });

  it('privatelink subnets have prefix = VPC prefix + 8', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/18');
    for (const subnet of result.privatelinkSubnets) {
      const { prefixLength } = parseCidr(subnet);
      expect(prefixLength).toBe(26); // 18 + 8
    }
  });

  it('calculates subnets for a different VPC CIDR (10.1.0.0/18)', () => {
    const result = calculateAwsIsolatedSubnets('10.1.0.0/18');
    expect(result.privateSubnets).toEqual([
      '10.1.0.0/22',
      '10.1.4.0/22',
      '10.1.8.0/22',
    ]);
    expect(result.privatelinkSubnets).toEqual([
      '10.1.28.0/26',
      '10.1.28.64/26',
      '10.1.28.128/26',
    ]);
  });

  it('calculates subnets for a /16 VPC CIDR', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/16');
    // private: /(16+4)=20 => each is 4096 addresses
    expect(result.privateSubnets).toEqual([
      '10.0.0.0/20',
      '10.0.16.0/20',
      '10.0.32.0/20',
    ]);
    // privatelink: /(16+8)=24 => each is 256 addresses
    // offset = floor(65536 * 7 / 16 / 256) * 256 = floor(112) * 256 = 28672
    // 10.0.0.0 + 28672 = 10.0.112.0
    expect(result.privatelinkSubnets).toEqual([
      '10.0.112.0/24',
      '10.0.113.0/24',
      '10.0.114.0/24',
    ]);
  });

  it('all subnets fit within the VPC CIDR', () => {
    const vpcCidr = '10.0.0.0/18';
    const result = calculateAwsIsolatedSubnets(vpcCidr);
    const allSubnets = [...result.privateSubnets, ...result.privatelinkSubnets];
    for (const subnet of allSubnets) {
      expect(isSubnetOf(subnet, vpcCidr)).toBe(true);
    }
  });

  it('private and privatelink subnets do not overlap', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/18');
    for (const priv of result.privateSubnets) {
      for (const pl of result.privatelinkSubnets) {
        expect(subnetsOverlap(priv, pl)).toBe(false);
      }
    }
  });

  it('private subnets do not overlap with each other', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/18');
    for (let i = 0; i < result.privateSubnets.length; i++) {
      for (let j = i + 1; j < result.privateSubnets.length; j++) {
        expect(subnetsOverlap(result.privateSubnets[i], result.privateSubnets[j])).toBe(false);
      }
    }
  });

  it('privatelink subnets do not overlap with each other', () => {
    const result = calculateAwsIsolatedSubnets('10.0.0.0/18');
    for (let i = 0; i < result.privatelinkSubnets.length; i++) {
      for (let j = i + 1; j < result.privatelinkSubnets.length; j++) {
        expect(subnetsOverlap(result.privatelinkSubnets[i], result.privatelinkSubnets[j])).toBe(false);
      }
    }
  });
});

// ─── subnetsOverlap ─────────────────────────────────────────────────────────

describe('subnetsOverlap', () => {
  it('detects overlapping subnets', () => {
    expect(subnetsOverlap('10.0.0.0/24', '10.0.0.128/25')).toBe(true);
  });

  it('returns false for non-overlapping adjacent subnets', () => {
    expect(subnetsOverlap('10.0.0.0/25', '10.0.0.128/25')).toBe(false);
  });

  it('detects contained subnet as overlapping', () => {
    expect(subnetsOverlap('10.0.0.0/16', '10.0.1.0/24')).toBe(true);
  });

  it('detects same CIDR as overlapping', () => {
    expect(subnetsOverlap('10.0.0.0/24', '10.0.0.0/24')).toBe(true);
  });

  it('returns false for completely separate ranges', () => {
    expect(subnetsOverlap('10.0.0.0/24', '10.0.1.0/24')).toBe(false);
  });

  it('returns false for different /8 ranges', () => {
    expect(subnetsOverlap('10.0.0.0/8', '172.16.0.0/12')).toBe(false);
  });

  it('detects overlap when ranges partially overlap', () => {
    // 10.0.0.0/23 covers 10.0.0.0 - 10.0.1.255
    // 10.0.1.0/24 covers 10.0.1.0 - 10.0.1.255
    expect(subnetsOverlap('10.0.0.0/23', '10.0.1.0/24')).toBe(true);
  });

  it('handles /32 single-host overlap', () => {
    expect(subnetsOverlap('10.0.0.1/32', '10.0.0.0/24')).toBe(true);
    expect(subnetsOverlap('10.0.0.1/32', '10.0.1.0/24')).toBe(false);
  });
});

// ─── isSubnetOf ─────────────────────────────────────────────────────────────

describe('isSubnetOf', () => {
  it('detects child inside parent', () => {
    expect(isSubnetOf('10.0.1.0/24', '10.0.0.0/16')).toBe(true);
  });

  it('returns false when child is outside parent', () => {
    expect(isSubnetOf('10.1.0.0/24', '10.0.0.0/16')).toBe(false);
  });

  it('returns true for same CIDR', () => {
    expect(isSubnetOf('10.0.0.0/24', '10.0.0.0/24')).toBe(true);
  });

  it('returns false when child is larger than parent', () => {
    expect(isSubnetOf('10.0.0.0/16', '10.0.0.0/24')).toBe(false);
  });

  it('returns true for /32 inside /24', () => {
    expect(isSubnetOf('10.0.0.5/32', '10.0.0.0/24')).toBe(true);
  });

  it('returns false for /32 outside /24', () => {
    expect(isSubnetOf('10.0.1.5/32', '10.0.0.0/24')).toBe(false);
  });

  it('handles /0 as universal parent', () => {
    expect(isSubnetOf('10.0.0.0/24', '0.0.0.0/0')).toBe(true);
    expect(isSubnetOf('192.168.0.0/16', '0.0.0.0/0')).toBe(true);
  });

  it('returns false for partially overlapping ranges', () => {
    // 10.0.0.0/23 is 10.0.0.0-10.0.1.255 (512 addresses)
    // 10.0.0.0/24 is 10.0.0.0-10.0.0.255 (256 addresses)
    // /23 does not fit inside /24
    expect(isSubnetOf('10.0.0.0/23', '10.0.0.0/24')).toBe(false);
    // /24 fits inside /23
    expect(isSubnetOf('10.0.0.0/24', '10.0.0.0/23')).toBe(true);
  });
});
