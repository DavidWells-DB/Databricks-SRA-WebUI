import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WizardSidebar from './WizardSidebar';
import { WIZARD_STEPS } from '../../schemas/types';

/** Determine the active step id from the current pathname. */
function resolveCurrentStep(pathname: string): string {
  // pathname will be something like /configure, /configure/account, etc.
  const suffix = pathname.replace(/^\/configure\/?/, '');
  const match = WIZARD_STEPS.find((s) => {
    const stepSuffix = s.path.replace(/^\//, '');
    return stepSuffix === suffix;
  });
  return match?.id ?? WIZARD_STEPS[0].id;
}

export default function AppShell() {
  const location = useLocation();
  const currentStep = resolveCurrentStep(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <WizardSidebar currentStep={currentStep} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
