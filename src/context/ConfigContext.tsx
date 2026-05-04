import { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { Provider } from '../schemas/types';
import {
  ConfigContext,
  STORAGE_KEY,
  deserialise,
  initialState,
  reducer,
  serialise,
} from './useConfig';

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
