import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/steps/LandingPage';
import AppShell from './components/layout/AppShell';
import { ConfigProvider } from './context/ConfigContext';
import Step1_ProviderMode from './components/steps/Step1_ProviderMode';
import Step2_Account from './components/steps/Step2_Account';
import Step3_Network from './components/steps/Step3_Network';
import Step4_Security from './components/steps/Step4_Security';
import Step5_Advanced from './components/steps/Step5_Advanced';
import Step6_Review from './components/steps/Step6_Review';
import AWSIsolatedNetwork from './components/providers/aws/AWSIsolatedNetwork';
import { useEffect } from 'react';
import { useConfig } from './context/ConfigContext';

/**
 * Demo page: renders the AWS Isolated Network step directly
 * with pre-seeded state so you can see the interactive subnet
 * mask selectors and per-subnet input groups immediately.
 *
 * Access at: http://localhost:5173/#/demo
 */
function DemoNetworkPage() {
  const { setProvider, setMode, setField } = useConfig();

  useEffect(() => {
    setProvider('aws');
    setMode('isolated');
    setField('vpc_cidr_range', '10.0.0.0/18');
    setField('network_configuration', 'isolated');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[var(--color-surface)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Network Configuration Demo
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          AWS Isolated Network — interactive subnet mask selectors and per-subnet input groups.
        </p>
        <AWSIsolatedNetwork />
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/demo"
          element={
            <ConfigProvider>
              <DemoNetworkPage />
            </ConfigProvider>
          }
        />
        <Route
          path="/configure"
          element={
            <ConfigProvider>
              <AppShell />
            </ConfigProvider>
          }
        >
          <Route index element={<Step1_ProviderMode />} />
          <Route path="account" element={<Step2_Account />} />
          <Route path="network" element={<Step3_Network />} />
          <Route path="security" element={<Step4_Security />} />
          <Route path="advanced" element={<Step5_Advanced />} />
          <Route path="review" element={<Step6_Review />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
