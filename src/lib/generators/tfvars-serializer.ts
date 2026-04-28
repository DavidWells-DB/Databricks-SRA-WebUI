import type { TerraformType } from '../../schemas/types';

// ─── HCL-format serializer for terraform.tfvars output ───────────────────────

/**
 * Serialize a value to HCL syntax based on its Terraform type.
 *
 * @param value      The JS value to serialize.
 * @param terraformType  The Terraform type descriptor from the schema.
 * @param indent     Current indentation level (number of spaces). Defaults to 0.
 * @returns          HCL-formatted string representation.
 */
export function serializeValue(
  value: unknown,
  terraformType: TerraformType,
  indent: number = 0,
): string {
  if (value === null || value === undefined) {
    return serializeNull();
  }

  // Object type descriptor
  if (typeof terraformType === 'object' && 'object' in terraformType) {
    return serializeObject(
      value as Record<string, unknown>,
      terraformType.object,
      indent,
    );
  }

  switch (terraformType) {
    case 'string':
      return serializeString(value as string);

    case 'bool':
      return serializeBool(value as boolean);

    case 'number':
      return serializeNumber(value as number);

    case 'list(string)':
      return serializeList(value as unknown[], 'string');

    case 'list(number)':
      return serializeList(value as unknown[], 'number');

    case 'set(string)':
      return serializeList(value as unknown[], 'string');

    case 'map(string)':
      return serializeMap(value as Record<string, unknown>);

    case 'map(any)':
      return serializeMap(value as Record<string, unknown>);

    default:
      return serializeString(String(value));
  }
}

/**
 * Wrap a string value in double quotes, escaping special HCL characters.
 */
export function serializeString(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `"${escaped}"`;
}

/**
 * Serialize a boolean to lowercase "true" or "false".
 */
export function serializeBool(value: boolean): string {
  return value ? 'true' : 'false';
}

/**
 * Serialize a number to its string representation.
 */
export function serializeNumber(value: number): string {
  return String(value);
}

/**
 * Serialize a null/undefined value.
 */
export function serializeNull(): string {
  return 'null';
}

/**
 * Serialize a list (array) to HCL list syntax.
 *
 * @example serializeList(["a", "b", "c"], "string")
 * // '["a", "b", "c"]'
 */
export function serializeList(values: unknown[], itemType?: string): string {
  const items = values.map((v) => {
    if (v === null || v === undefined) return serializeNull();
    switch (itemType) {
      case 'string':
        return serializeString(String(v));
      case 'number':
        return serializeNumber(Number(v));
      default:
        return typeof v === 'string' ? serializeString(v) : String(v);
    }
  });
  return `[${items.join(', ')}]`;
}

/**
 * Serialize a map (plain object) to multi-line HCL map syntax.
 *
 * @example serializeMap({ Owner: "user@example.com" })
 * // '{\n  Owner = "user@example.com"\n}'
 */
export function serializeMap(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }

  const lines = entries.map(([key, val]) => {
    const serializedVal =
      typeof val === 'string'
        ? serializeString(val)
        : typeof val === 'number'
          ? serializeNumber(val)
          : typeof val === 'boolean'
            ? serializeBool(val)
            : val === null || val === undefined
              ? serializeNull()
              : serializeString(String(val));
    return `  ${key} = ${serializedVal}`;
  });

  return `{\n${lines.join('\n')}\n}`;
}

/**
 * Serialize a Terraform object to nested HCL syntax with proper indentation.
 *
 * @example
 * serializeObject(
 *   { cidr: "10.0.4.0/22" },
 *   { cidr: { type: "string" } },
 *   0,
 * )
 * // '{\n  cidr = "10.0.4.0/22"\n}'
 */
export function serializeObject(
  obj: Record<string, unknown>,
  typeDef: Record<
    string,
    TerraformType | { type: TerraformType; optional?: boolean; default?: unknown }
  >,
  indent: number = 0,
): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }

  const pad = ' '.repeat(indent + 2);
  const closePad = ' '.repeat(indent);

  const lines = entries.map(([key, val]) => {
    const fieldSpec = typeDef[key];
    let fieldType: TerraformType;

    if (fieldSpec === undefined) {
      // Unknown field -- fall back to guessing based on JS type
      fieldType = typeof val === 'boolean' ? 'bool' : typeof val === 'number' ? 'number' : 'string';
    } else if (typeof fieldSpec === 'object' && fieldSpec !== null && 'type' in fieldSpec) {
      fieldType = (fieldSpec as { type: TerraformType }).type;
    } else {
      fieldType = fieldSpec as TerraformType;
    }

    const serializedVal = serializeValue(val, fieldType, indent + 2);
    return `${pad}${key} = ${serializedVal}`;
  });

  return `{\n${lines.join('\n')}\n${closePad}}`;
}
