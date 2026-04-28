import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Provider, FormValues, FormErrors } from '../schemas/types';

// ─── State ──────────────────────────────────────────────────────────────────

export interface ConfigState {
  provider: Provider | null;
  deploymentMode: string | null;
  values: FormValues;
  errors: FormErrors;
  touched: Record<string, boolean>;
  completedSteps: Set<string>;
}

const initialState: ConfigState = {
  provider: null,
  deploymentMode: null,
  values: {},
  errors: {},
  touched: {},
  completedSteps: new Set(),
};

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_PROVIDER'; payload: Provider }
  | { type: 'SET_MODE'; payload: string }
  | { type: 'SET_FIELD'; payload: { name: string; value: unknown } }
  | { type: 'SET_ERROR'; payload: { name: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'TOUCH_FIELD'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_STATE'; payload: ConfigState };

function reducer(state: ConfigState, action: Action): ConfigState {
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

// ─── Serialisation helpers (Set is not JSON-serialisable) ───────────────────

const STORAGE_KEY = 'sra-config-state';

/** Fields that should never be persisted (passwords, tokens, etc.) */
const SENSITIVE_PATTERNS = ['password', 'secret', 'token', 'key'];

function isSensitive(name: string): boolean {
  const lower = name.toLowerCase();
  return SENSITIVE_PATTERNS.some((p) => lower.includes(p));
}

function serialise(state: ConfigState): string {
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

function deserialise(json: string): ConfigState | null {
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

// ─── Context ────────────────────────────────────────────────────────────────

interface ConfigContextValue {
  state: ConfigState;
  dispatch: React.Dispatch<Action>;
  setField: (name: string, value: unknown) => void;
  getFieldValue: (name: string) => unknown;
  setProvider: (provider: Provider) => void;
  setMode: (mode: string) => void;
  completeStep: (stepId: string) => void;
  resetForm: () => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = deserialise(stored);
        if (restored && restored.provider) return restored;
      }
    } catch {
      // ignore
    }
    return { ...initialState, completedSteps: new Set<string>() };
  });

  // Persist on every state change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, serialise(state));
    } catch {
      // ignore
    }
  }, [state]);

  const setField = useCallback(
    (name: string, value: unknown) => {
      dispatch({ type: 'SET_FIELD', payload: { name, value } });
    },
    [],
  );

  const getFieldValue = useCallback(
    (name: string) => state.values[name],
    [state.values],
  );

  const setProvider = useCallback(
    (provider: Provider) => dispatch({ type: 'SET_PROVIDER', payload: provider }),
    [],
  );

  const setMode = useCallback(
    (mode: string) => dispatch({ type: 'SET_MODE', payload: mode }),
    [],
  );

  const completeStep = useCallback(
    (stepId: string) => dispatch({ type: 'COMPLETE_STEP', payload: stepId }),
    [],
  );

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        state,
        dispatch,
        setField,
        getFieldValue,
        setProvider,
        setMode,
        completeStep,
        resetForm,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return ctx;
}
