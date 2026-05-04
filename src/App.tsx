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

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
