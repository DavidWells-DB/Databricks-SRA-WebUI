import { createContext, useContext } from 'react';
import type { Provider, FormValues, FormErrors } from '../schemas/types';

export interface ConfigState {
  provider: Provider | null;
  deploymentMode: string | null;
  values: FormValues;
  errors: FormErrors;
  touched: Record<string, boolean>;
  completedSteps: Set<string>;
}

export const initialState: ConfigState = {
  provider: null,
  deploymentMode: null,
  values: {},
  errors: {},
  touched: {},
  completedSteps: new Set(),
};

export type ConfigAction =
  | { type: 'SET_PROVIDER'; payload: Provider }
  | { type: 'SET_MODE'; payload: string }
  | { type: 'SET_FIELD'; payload: { name: string; value: unknown } }
  | { type: 'SET_ERROR'; payload: { name: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'TOUCH_FIELD'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_STATE'; payload: ConfigState };

export function reducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload };
    case 'SET_MODE':
      return { ...state, deploymentMode: action.payload };
    case 'SET_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.payload.name]: action.payload.value },
        touched: { ...state.touched, [action.payload.name]: true },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.name]: action.payload.message },
      };
    case 'CLEAR_ERROR': {
      const errors = { ...state.errors };
      delete errors[action.payload];
      return { ...state, errors };
    }
    case 'TOUCH_FIELD':
      return { ...state, touched: { ...state.touched, [action.payload]: true } };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };
    case 'RESET_FORM':
      return { ...initialState, completedSteps: new Set() };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export const STORAGE_KEY = 'sra-config-state';

const SENSITIVE_PATTERNS = ['password', 'secret', 'token', 'key'];

export function isSensitive(name: string): boolean {
  const lower = name.toLowerCase();
  return SENSITIVE_PATTERNS.some((p) => lower.includes(p));
}

export function serialise(state: ConfigState): string {
  const safeValues: FormValues = {};
  for (const [k, v] of Object.entries(state.values)) {
    if (!isSensitive(k)) safeValues[k] = v;
  }
  return JSON.stringify({
    ...state,
    values: safeValues,
    completedSteps: [...state.completedSteps],
  });
}

export function deserialise(json: string): ConfigState | null {
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    return {
      provider: raw.provider as Provider | null,
      deploymentMode: raw.deploymentMode as string | null,
      values: (raw.values ?? {}) as FormValues,
      errors: (raw.errors ?? {}) as FormErrors,
      touched: (raw.touched ?? {}) as Record<string, boolean>,
      completedSteps: new Set(raw.completedSteps as string[]),
    };
  } catch {
    return null;
  }
}

export interface ConfigContextValue {
  state: ConfigState;
  dispatch: React.Dispatch<ConfigAction>;
  setField: (name: string, value: unknown) => void;
  getFieldValue: (name: string) => unknown;
  setProvider: (provider: Provider) => void;
  setMode: (mode: string) => void;
  completeStep: (stepId: string) => void;
  resetForm: () => void;
}

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return ctx;
}
