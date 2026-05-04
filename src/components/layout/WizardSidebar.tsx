import { useNavigate } from 'react-router-dom';
import { WIZARD_STEPS } from '../../schemas/types';
import { useConfig } from '../../context/useConfig';

interface WizardSidebarProps {
  currentStep: string;
}

export default function WizardSidebar({ currentStep }: WizardSidebarProps) {
  const { state } = useConfig();
  const navigate = useNavigate();

  function handleClick(step: (typeof WIZARD_STEPS)[number]) {
    navigate(`/configure${step.path}`);
  }

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0 py-4 pr-4 border-r border-[var(--color-border)]">
        {WIZARD_STEPS.map((step, i) => {
          const isActive = step.id === currentStep;
          const isCompleted = state.completedSteps.has(step.id);
          const isClickable = isCompleted || isActive;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && handleClick(step)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white font-medium'
                  : isCompleted
                    ? 'text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] cursor-pointer'
                    : 'text-[var(--color-text-tertiary)] cursor-not-allowed opacity-60'
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 ${
                  isCompleted && !isActive
                    ? 'bg-[var(--color-success)] text-white'
                    : isActive
                      ? 'bg-white text-[var(--color-primary)]'
                      : 'border border-current'
                }`}
              >
                {isCompleted && !isActive ? '\u2713' : i + 1}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile: horizontal progress bar */}
      <nav className="flex md:hidden items-center gap-1 px-4 py-3 overflow-x-auto border-b border-[var(--color-border)]">
        {WIZARD_STEPS.map((step, i) => {
          const isActive = step.id === currentStep;
          const isCompleted = state.completedSteps.has(step.id);
          const isClickable = isCompleted || isActive;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && handleClick(step)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white font-medium'
                  : isCompleted
                    ? 'text-[var(--color-text)] cursor-pointer'
                    : 'text-[var(--color-text-tertiary)] cursor-not-allowed opacity-60'
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold shrink-0 ${
                  isCompleted && !isActive
                    ? 'bg-[var(--color-success)] text-white'
                    : isActive
                      ? 'bg-white text-[var(--color-primary)]'
                      : 'border border-current'
                }`}
              >
                {isCompleted && !isActive ? '\u2713' : i + 1}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
