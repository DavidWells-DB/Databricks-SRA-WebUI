import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from '../../src/context/ConfigContext';
import { useConfig } from '../../src/context/useConfig';
import type { Provider } from '../../src/schemas/types';

import Step1_ProviderMode from '../../src/components/steps/Step1_ProviderMode';
import Step2_Account from '../../src/components/steps/Step2_Account';
import Step3_Network from '../../src/components/steps/Step3_Network';
import Step4_Security from '../../src/components/steps/Step4_Security';
import Step5_Advanced from '../../src/components/steps/Step5_Advanced';
import Step6_Review from '../../src/components/steps/Step6_Review';

// ─── Test harness ──────────────────────────────────────────────────────────

function Seeder({
  provider,
  mode,
  children,
}: {
  provider: Provider | null;
  mode: string | null;
  children: ReactNode;
}) {
  const api = useConfig();
  useEffect(() => {
    if (provider) api.setProvider(provider);
    if (mode) api.setMode(mode);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function renderStep(
  Step: () => JSX.Element,
  opts: { provider: Provider | null; mode: string | null; route?: string } = {
    provider: null,
    mode: null,
  },
) {
  return render(
    <MemoryRouter initialEntries={[opts.route ?? '/configure']}>
      <ConfigProvider>
        <Seeder provider={opts.provider} mode={opts.mode}>
          <Step />
        </Seeder>
      </ConfigProvider>
    </MemoryRouter>,
  );
}

const PROVIDER_MODES: { provider: Provider; mode: string }[] = [
  { provider: 'aws', mode: 'isolated' },
  { provider: 'aws', mode: 'custom' },
  { provider: 'azure', mode: 'full-sra' },
  { provider: 'azure', mode: 'byo-hub' },
  { provider: 'azure', mode: 'byo-spoke' },
  { provider: 'gcp', mode: 'new-vpc' },
  { provider: 'gcp', mode: 'existing-vpc' },
];

const STEPS: { name: string; Component: () => JSX.Element }[] = [
  { name: 'Step1_ProviderMode', Component: Step1_ProviderMode },
  { name: 'Step2_Account', Component: Step2_Account },
  { name: 'Step3_Network', Component: Step3_Network },
  { name: 'Step4_Security', Component: Step4_Security },
  { name: 'Step5_Advanced', Component: Step5_Advanced },
  { name: 'Step6_Review', Component: Step6_Review },
];

// ─── Smoke matrix: each step × each provider/mode ───────────────────────────

describe('Wizard step smoke tests', () => {
  // Step 1 doesn't need provider/mode pre-seeded, but it should also not crash
  // when state already has them (returning user).
  it('Step1_ProviderMode renders with no state', () => {
    expect(() =>
      renderStep(Step1_ProviderMode, { provider: null, mode: null }),
    ).not.toThrow();
  });

  for (const { provider, mode } of PROVIDER_MODES) {
    for (const { name, Component } of STEPS) {
      it(`${name} renders for ${provider} / ${mode}`, () => {
        let renderResult: ReturnType<typeof renderStep> | undefined;
        expect(() => {
          renderResult = renderStep(Component, { provider, mode });
        }).not.toThrow();
        // Sanity: something rendered
        expect(renderResult!.container.firstChild).not.toBeNull();
      });
    }
  }
});

// ─── State propagation smoke ───────────────────────────────────────────────

describe('Step2_Account state propagation', () => {
  it('typed values flow through ConfigProvider', () => {
    let api!: ReturnType<typeof useConfig>;
    function Probe() {
      const local = useConfig();
      useEffect(() => {
        api = local;
      });
      return null;
    }
    render(
      <MemoryRouter initialEntries={['/configure/account']}>
        <ConfigProvider>
          <Seeder provider="aws" mode="isolated">
            <Probe />
            <Step2_Account />
          </Seeder>
        </ConfigProvider>
      </MemoryRouter>,
    );

    act(() => {
      api.setField('aws_account_id', '123456789012');
      api.setField('region', 'us-east-1');
    });

    expect(api.getFieldValue('aws_account_id')).toBe('123456789012');
    expect(api.getFieldValue('region')).toBe('us-east-1');
    expect(api.state.touched.aws_account_id).toBe(true);
  });
});
