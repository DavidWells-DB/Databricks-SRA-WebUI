import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useEffect } from 'react';
import { ConfigProvider } from '../../src/context/ConfigContext';
import {
  reducer,
  initialState,
  isSensitive,
  serialise,
  deserialise,
  STORAGE_KEY,
  useConfig,
  type ConfigState,
} from '../../src/context/useConfig';

// ─── Reducer pure-function tests ────────────────────────────────────────────

describe('ConfigContext reducer', () => {
  it('SET_PROVIDER updates state.provider only', () => {
    const next = reducer(initialState, { type: 'SET_PROVIDER', payload: 'aws' });
    expect(next.provider).toBe('aws');
    expect(next.deploymentMode).toBe(null);
    expect(next.values).toEqual({});
  });

  it('SET_MODE updates state.deploymentMode only', () => {
    const next = reducer(
      { ...initialState, provider: 'aws' },
      { type: 'SET_MODE', payload: 'isolated' },
    );
    expect(next.deploymentMode).toBe('isolated');
    expect(next.provider).toBe('aws');
  });

  it('SET_FIELD writes to values[name] and marks touched', () => {
    const next = reducer(initialState, {
      type: 'SET_FIELD',
      payload: { name: 'aws_account_id', value: '123456789012' },
    });
    expect(next.values.aws_account_id).toBe('123456789012');
    expect(next.touched.aws_account_id).toBe(true);
  });

  it('SET_FIELD preserves earlier fields and earlier touched flags', () => {
    const seeded: ConfigState = {
      ...initialState,
      values: { existing_field: 'keep' },
      touched: { existing_field: true },
    };
    const next = reducer(seeded, {
      type: 'SET_FIELD',
      payload: { name: 'new_field', value: 'added' },
    });
    expect(next.values).toEqual({ existing_field: 'keep', new_field: 'added' });
    expect(next.touched).toEqual({ existing_field: true, new_field: true });
  });

  it('SET_ERROR + CLEAR_ERROR round-trip', () => {
    const withError = reducer(initialState, {
      type: 'SET_ERROR',
      payload: { name: 'aws_account_id', message: 'Required' },
    });
    expect(withError.errors.aws_account_id).toBe('Required');

    const cleared = reducer(withError, {
      type: 'CLEAR_ERROR',
      payload: 'aws_account_id',
    });
    expect(cleared.errors.aws_account_id).toBeUndefined();
  });

  it('TOUCH_FIELD marks the field touched without writing values', () => {
    const next = reducer(initialState, { type: 'TOUCH_FIELD', payload: 'region' });
    expect(next.touched.region).toBe(true);
    expect(next.values).toEqual({});
  });

  it('COMPLETE_STEP accumulates step ids in a Set', () => {
    let s = reducer(initialState, { type: 'COMPLETE_STEP', payload: 'provider' });
    s = reducer(s, { type: 'COMPLETE_STEP', payload: 'account' });
    s = reducer(s, { type: 'COMPLETE_STEP', payload: 'provider' }); // duplicate
    expect(s.completedSteps).toBeInstanceOf(Set);
    expect(s.completedSteps.has('provider')).toBe(true);
    expect(s.completedSteps.has('account')).toBe(true);
    expect(s.completedSteps.size).toBe(2);
  });

  it('RESET_FORM returns initial state with empty completedSteps', () => {
    const seeded: ConfigState = {
      provider: 'aws',
      deploymentMode: 'isolated',
      values: { aws_account_id: '123' },
      errors: { aws_account_id: 'oops' },
      touched: { aws_account_id: true },
      completedSteps: new Set(['provider']),
    };
    const next = reducer(seeded, { type: 'RESET_FORM' });
    expect(next.provider).toBe(null);
    expect(next.deploymentMode).toBe(null);
    expect(next.values).toEqual({});
    expect(next.errors).toEqual({});
    expect(next.touched).toEqual({});
    expect(next.completedSteps.size).toBe(0);
  });

  it('LOAD_STATE replaces state wholesale', () => {
    const replacement: ConfigState = {
      provider: 'gcp',
      deploymentMode: 'new-vpc',
      values: { foo: 'bar' },
      errors: {},
      touched: {},
      completedSteps: new Set(['provider', 'account']),
    };
    const next = reducer(initialState, { type: 'LOAD_STATE', payload: replacement });
    expect(next).toBe(replacement);
  });
});

// ─── isSensitive matcher ────────────────────────────────────────────────────

describe('isSensitive', () => {
  it.each([
    ['client_secret', true],
    ['password', true],
    ['service_account_key', true],
    ['api_token', true],
    ['MY_PASSWORD', true],
    ['aws_account_id', false],
    ['region', false],
    ['vpc_cidr_range', false],
    ['workspace_name', false],
  ])('isSensitive(%s) → %s', (name, expected) => {
    expect(isSensitive(name)).toBe(expected);
  });
});

// ─── serialise / deserialise ────────────────────────────────────────────────

describe('serialise / deserialise', () => {
  it('round-trips ordinary state', () => {
    const seeded: ConfigState = {
      provider: 'aws',
      deploymentMode: 'isolated',
      values: { aws_account_id: '123', vpc_cidr_range: '10.0.0.0/18' },
      errors: {},
      touched: { aws_account_id: true },
      completedSteps: new Set(['provider', 'account']),
    };
    const json = serialise(seeded);
    const restored = deserialise(json);
    expect(restored).not.toBeNull();
    expect(restored!.provider).toBe('aws');
    expect(restored!.deploymentMode).toBe('isolated');
    expect(restored!.values).toEqual(seeded.values);
    expect(restored!.completedSteps).toBeInstanceOf(Set);
    expect([...restored!.completedSteps].sort()).toEqual(['account', 'provider']);
  });

  it('drops sensitive values during serialise', () => {
    const seeded: ConfigState = {
      ...initialState,
      values: {
        aws_account_id: '123',
        client_secret: 'super-secret',
        api_token: 'xoxp-...',
        ordinary_key_field: 'value', // matches "key" pattern → stripped
      },
    };
    const json = serialise(seeded);
    const restored = deserialise(json)!;
    expect(restored.values.aws_account_id).toBe('123');
    expect(restored.values.client_secret).toBeUndefined();
    expect(restored.values.api_token).toBeUndefined();
    expect(restored.values.ordinary_key_field).toBeUndefined();
  });

  it('deserialise returns null for invalid JSON', () => {
    expect(deserialise('{not json')).toBeNull();
  });
});

// ─── ConfigProvider localStorage round-trip ─────────────────────────────────

describe('ConfigProvider localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function HookProbe({
    onReady,
  }: {
    onReady: (api: ReturnType<typeof useConfig>) => void;
  }) {
    const api = useConfig();
    useEffect(() => {
      onReady(api);
    });
    return null;
  }

  it('persists non-sensitive fields and rehydrates on remount', () => {
    let api1!: ReturnType<typeof useConfig>;
    const { unmount } = render(
      <ConfigProvider>
        <HookProbe onReady={(a) => (api1 = a)} />
      </ConfigProvider>,
    );

    act(() => {
      api1.setProvider('aws');
      api1.setMode('isolated');
      api1.setField('aws_account_id', '123456789012');
      api1.completeStep('provider');
    });

    unmount();

    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.provider).toBe('aws');
    expect(parsed.values.aws_account_id).toBe('123456789012');
    expect(parsed.completedSteps).toEqual(['provider']);

    let api2!: ReturnType<typeof useConfig>;
    render(
      <ConfigProvider>
        <HookProbe onReady={(a) => (api2 = a)} />
      </ConfigProvider>,
    );
    expect(api2.state.provider).toBe('aws');
    expect(api2.state.deploymentMode).toBe('isolated');
    expect(api2.getFieldValue('aws_account_id')).toBe('123456789012');
    expect(api2.state.completedSteps.has('provider')).toBe(true);
  });

  it('does not persist sensitive fields', () => {
    let api!: ReturnType<typeof useConfig>;
    render(
      <ConfigProvider>
        <HookProbe onReady={(a) => (api = a)} />
      </ConfigProvider>,
    );

    act(() => {
      api.setProvider('azure');
      api.setField('client_secret', 'super-secret-value');
      api.setField('subscription_id', 'sub-123');
    });

    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(parsed.values.subscription_id).toBe('sub-123');
    expect(parsed.values.client_secret).toBeUndefined();
  });

  it('resetForm wipes state and a fresh ConfigProvider boots into initial state', () => {
    let api1!: ReturnType<typeof useConfig>;
    const { unmount } = render(
      <ConfigProvider>
        <HookProbe onReady={(a) => (api1 = a)} />
      </ConfigProvider>,
    );

    act(() => {
      api1.setProvider('gcp');
      api1.setField('google_project', 'my-project');
    });

    act(() => {
      api1.resetForm();
    });

    expect(api1.state.provider).toBe(null);
    expect(api1.getFieldValue('google_project')).toBeUndefined();

    // ConfigProvider's persist-on-state-change effect re-writes the cleared
    // state back to localStorage. The user-visible invariant is that a fresh
    // mount starts at initial state — verify that.
    unmount();
    let api2!: ReturnType<typeof useConfig>;
    render(
      <ConfigProvider>
        <HookProbe onReady={(a) => (api2 = a)} />
      </ConfigProvider>,
    );
    expect(api2.state.provider).toBe(null);
    expect(api2.getFieldValue('google_project')).toBeUndefined();
  });
});
