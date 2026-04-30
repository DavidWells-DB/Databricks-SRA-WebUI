// ─── Terraform type primitives ───────────────────────────────────────────────

export type TerraformPrimitive = 'string' | 'number' | 'bool';

export type TerraformType =
  | TerraformPrimitive
  | 'list(string)'
  | 'list(number)'
  | 'set(string)'
  | 'map(string)'
  | 'map(any)'
  | {
      object: Record<
        string,
        TerraformType | { type: TerraformType; optional?: boolean; default?: unknown }
      >;
    };

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationRule {
  type:
    | 'regex'
    | 'enum'
    | 'range'
    | 'cidr'
    | 'cidr-range'
    | 'email'
    | 'uuid'
    | 'custom';
  /** regex pattern, enum array, {min,max} for range, {minPrefix,maxPrefix} for cidr-range */
  value?: unknown;
  message: string;
}

// ─── Conditional logic ───────────────────────────────────────────────────────

export interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'truthy' | 'falsy';
  value?: unknown;
}

// ─── Schema variable (one form field) ────────────────────────────────────────

export interface SchemaVariable {
  name: string;
  terraformType: TerraformType;
  description: string;
  required: boolean;
  sensitive: boolean;
  default?: unknown;
  nullable: boolean;
  validation?: ValidationRule[];
  ui: {
    label: string;
    group: string;
    order: number;
    inputType?:
      | 'text'
      | 'select'
      | 'cidr'
      | 'cidr-list'
      | 'checkbox'
      | 'radio'
      | 'object-editor'
      | 'map-editor'
      | 'sensitive'
      | 'email'
      | 'number'
      | 'textarea'
      | 'list-editor';
    options?: { value: string; label: string }[];
    /** Constrains keys for `map-editor` inputs to a fixed set with optional per-key hint */
    mapKeyOptions?: { value: string; label: string; hint?: string }[];
    visibleWhen?: Condition[];
    requiredWhen?: Condition[];
    helpText?: string;
    placeholder?: string;
    width?: 'full' | 'half';
  };
}

// ─── Deployment modes ────────────────────────────────────────────────────────

export interface DeploymentMode {
  id: string;
  label: string;
  description: string;
  icon?: string;
  recommended?: boolean;
  /** Variable names included in this mode */
  variables: string[];
  /** Values that are always set (not user-editable) */
  fixedValues: Record<string, unknown>;
  /** Per-variable required overrides (true = force required, false = force optional) */
  requiredOverrides: Record<string, boolean>;
  /** Per-variable default overrides */
  defaultOverrides: Record<string, unknown>;
}

// ─── Provider schema ─────────────────────────────────────────────────────────

export interface ProviderSchema {
  provider: Provider;
  displayName: string;
  description: string;
  deploymentModes: DeploymentMode[];
  variables: SchemaVariable[];
}

// ─── Convenience aliases ─────────────────────────────────────────────────────

export type Provider = 'aws' | 'azure' | 'gcp';

export interface FormValues {
  [key: string]: unknown;
}

export interface FormErrors {
  [key: string]: string;
}

// ─── Wizard steps ────────────────────────────────────────────────────────────

export interface WizardStep {
  id: string;
  label: string;
  path: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'provider', label: 'Provider & Mode', path: '' },
  { id: 'account', label: 'Account & Identity', path: '/account' },
  { id: 'network', label: 'Network', path: '/network' },
  { id: 'security', label: 'Security', path: '/security' },
  { id: 'advanced', label: 'Advanced', path: '/advanced' },
  { id: 'review', label: 'Review & Download', path: '/review' },
];
