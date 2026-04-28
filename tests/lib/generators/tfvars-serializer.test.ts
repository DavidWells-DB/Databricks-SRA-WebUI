import { describe, it, expect } from 'vitest';
import {
  serializeString,
  serializeBool,
  serializeNumber,
  serializeNull,
  serializeList,
  serializeMap,
  serializeValue,
  serializeObject,
} from '../../../src/lib/generators/tfvars-serializer';

// ─── serializeString ────────────────────────────────────────────────────────

describe('serializeString', () => {
  it('wraps a basic string in double quotes', () => {
    expect(serializeString('hello')).toBe('"hello"');
  });

  it('wraps empty string in double quotes', () => {
    expect(serializeString('')).toBe('""');
  });

  it('escapes backslashes', () => {
    expect(serializeString('path\\to\\file')).toBe('"path\\\\to\\\\file"');
  });

  it('escapes double quotes', () => {
    expect(serializeString('say "hello"')).toBe('"say \\"hello\\""');
  });

  it('escapes newlines', () => {
    expect(serializeString('line1\nline2')).toBe('"line1\\nline2"');
  });

  it('escapes carriage returns', () => {
    expect(serializeString('line1\rline2')).toBe('"line1\\rline2"');
  });

  it('escapes tabs', () => {
    expect(serializeString('col1\tcol2')).toBe('"col1\\tcol2"');
  });

  it('handles strings with multiple special characters', () => {
    expect(serializeString('a\\b"c\nd')).toBe('"a\\\\b\\"c\\nd"');
  });

  it('handles CIDR notation strings without escaping', () => {
    expect(serializeString('10.0.0.0/18')).toBe('"10.0.0.0/18"');
  });

  it('handles email addresses', () => {
    expect(serializeString('user@example.com')).toBe('"user@example.com"');
  });
});

// ─── serializeBool ──────────────────────────────────────────────────────────

describe('serializeBool', () => {
  it('serializes true', () => {
    expect(serializeBool(true)).toBe('true');
  });

  it('serializes false', () => {
    expect(serializeBool(false)).toBe('false');
  });
});

// ─── serializeNumber ────────────────────────────────────────────────────────

describe('serializeNumber', () => {
  it('serializes integers', () => {
    expect(serializeNumber(42)).toBe('42');
  });

  it('serializes zero', () => {
    expect(serializeNumber(0)).toBe('0');
  });

  it('serializes negative numbers', () => {
    expect(serializeNumber(-5)).toBe('-5');
  });

  it('serializes decimals', () => {
    expect(serializeNumber(3.14)).toBe('3.14');
  });

  it('serializes large numbers', () => {
    expect(serializeNumber(1000000)).toBe('1000000');
  });
});

// ─── serializeNull ──────────────────────────────────────────────────────────

describe('serializeNull', () => {
  it('outputs "null"', () => {
    expect(serializeNull()).toBe('null');
  });
});

// ─── serializeList ──────────────────────────────────────────────────────────

describe('serializeList', () => {
  it('serializes empty list', () => {
    expect(serializeList([])).toBe('[]');
  });

  it('serializes string list', () => {
    expect(serializeList(['a', 'b', 'c'], 'string')).toBe('["a", "b", "c"]');
  });

  it('serializes single-element string list', () => {
    expect(serializeList(['only'], 'string')).toBe('["only"]');
  });

  it('serializes number list', () => {
    expect(serializeList([1, 2, 3], 'number')).toBe('[1, 2, 3]');
  });

  it('serializes CIDR string list', () => {
    expect(serializeList(['10.0.0.0/22', '10.0.4.0/22', '10.0.8.0/22'], 'string')).toBe(
      '["10.0.0.0/22", "10.0.4.0/22", "10.0.8.0/22"]',
    );
  });

  it('serializes list with null values', () => {
    expect(serializeList([null, 'a', undefined], 'string')).toBe('[null, "a", null]');
  });

  it('serializes list without explicit item type (defaults)', () => {
    expect(serializeList(['x', 'y'])).toBe('["x", "y"]');
  });

  it('serializes list of numbers without explicit type', () => {
    expect(serializeList([1, 2])).toBe('[1, 2]');
  });

  it('serializes the SRA egress ports list', () => {
    const ports = [443, 2443, 5432, 6666, 8443, 8444, 8445, 8446, 8447, 8448, 8449, 8450, 8451];
    expect(serializeList(ports, 'number')).toBe(
      '[443, 2443, 5432, 6666, 8443, 8444, 8445, 8446, 8447, 8448, 8449, 8450, 8451]',
    );
  });
});

// ─── serializeMap ───────────────────────────────────────────────────────────

describe('serializeMap', () => {
  it('serializes empty map', () => {
    expect(serializeMap({})).toBe('{}');
  });

  it('serializes map with string values', () => {
    const result = serializeMap({ Owner: 'user@example.com' });
    expect(result).toBe('{\n  Owner = "user@example.com"\n}');
  });

  it('serializes map with multiple entries', () => {
    const result = serializeMap({ key1: 'value1', key2: 'value2' });
    expect(result).toBe('{\n  key1 = "value1"\n  key2 = "value2"\n}');
  });

  it('serializes map with number values', () => {
    const result = serializeMap({ count: 5 });
    expect(result).toBe('{\n  count = 5\n}');
  });

  it('serializes map with boolean values', () => {
    const result = serializeMap({ enabled: true, debug: false });
    expect(result).toBe('{\n  enabled = true\n  debug = false\n}');
  });

  it('serializes map with null values', () => {
    const result = serializeMap({ key: null });
    expect(result).toBe('{\n  key = null\n}');
  });

  it('serializes map with mixed value types', () => {
    const result = serializeMap({
      name: 'test',
      count: 42,
      active: true,
      removed: null,
    });
    expect(result).toContain('name = "test"');
    expect(result).toContain('count = 42');
    expect(result).toContain('active = true');
    expect(result).toContain('removed = null');
  });
});

// ─── serializeObject ────────────────────────────────────────────────────────

describe('serializeObject', () => {
  it('serializes empty object', () => {
    expect(serializeObject({}, {})).toBe('{}');
  });

  it('serializes object with string field using type descriptor', () => {
    const result = serializeObject(
      { cidr: '10.0.4.0/22' },
      { cidr: { type: 'string' } },
    );
    expect(result).toBe('{\n  cidr = "10.0.4.0/22"\n}');
  });

  it('serializes object with bool field', () => {
    const result = serializeObject(
      { enabled: true },
      { enabled: 'bool' },
    );
    expect(result).toBe('{\n  enabled = true\n}');
  });

  it('serializes object with number field', () => {
    const result = serializeObject(
      { port: 443 },
      { port: 'number' },
    );
    expect(result).toBe('{\n  port = 443\n}');
  });

  it('serializes object with unknown field by guessing type', () => {
    const result = serializeObject(
      { custom: 'value', flag: true, num: 99 },
      {},
    );
    expect(result).toContain('custom = "value"');
    expect(result).toContain('flag = true');
    expect(result).toContain('num = 99');
  });

  it('applies proper indentation at indent level 0', () => {
    const result = serializeObject(
      { a: 'x', b: 'y' },
      { a: 'string', b: 'string' },
      0,
    );
    const lines = result.split('\n');
    expect(lines[0]).toBe('{');
    expect(lines[1]).toBe('  a = "x"');
    expect(lines[2]).toBe('  b = "y"');
    expect(lines[3]).toBe('}');
  });
});

// ─── serializeValue (dispatch) ──────────────────────────────────────────────

describe('serializeValue', () => {
  it('dispatches string type', () => {
    expect(serializeValue('hello', 'string')).toBe('"hello"');
  });

  it('dispatches bool type', () => {
    expect(serializeValue(true, 'bool')).toBe('true');
    expect(serializeValue(false, 'bool')).toBe('false');
  });

  it('dispatches number type', () => {
    expect(serializeValue(42, 'number')).toBe('42');
  });

  it('dispatches list(string) type', () => {
    expect(serializeValue(['a', 'b'], 'list(string)')).toBe('["a", "b"]');
  });

  it('dispatches list(number) type', () => {
    expect(serializeValue([1, 2, 3], 'list(number)')).toBe('[1, 2, 3]');
  });

  it('dispatches set(string) type as list', () => {
    expect(serializeValue(['x', 'y'], 'set(string)')).toBe('["x", "y"]');
  });

  it('dispatches map(string) type', () => {
    const result = serializeValue({ key: 'val' }, 'map(string)');
    expect(result).toBe('{\n  key = "val"\n}');
  });

  it('dispatches map(any) type', () => {
    const result = serializeValue({ k: 'v' }, 'map(any)');
    expect(result).toBe('{\n  k = "v"\n}');
  });

  it('returns null for null value', () => {
    expect(serializeValue(null, 'string')).toBe('null');
  });

  it('returns null for undefined value', () => {
    expect(serializeValue(undefined, 'string')).toBe('null');
  });

  it('dispatches object type', () => {
    const result = serializeValue(
      { name: 'test' },
      { object: { name: 'string' } },
    );
    expect(result).toBe('{\n  name = "test"\n}');
  });

  it('falls back to string for unknown terraform type', () => {
    // Cast to any to simulate an unexpected type
    const result = serializeValue('fallback', 'unknown_type' as never);
    expect(result).toBe('"fallback"');
  });
});
