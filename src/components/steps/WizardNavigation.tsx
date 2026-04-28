import { useNavigate } from 'react-router-dom';

interface WizardNavigationProps {
  backPath?: string;
  continuePath: string;
  canContinue?: boolean;
  onContinue?: () => void;
}

export default function WizardNavigation({
  backPath,
  continuePath,
  canContinue = true,
  onContinue,
}: WizardNavigationProps) {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue?.();
    navigate(continuePath);
  };

  return (
    <div className="flex items-center justify-between pt-8 mt-8 border-t border-[var(--color-border)]">
      {backPath ? (
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="btn-hover-lift px-5 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-all font-medium"
        >
          Back
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue}
        className="btn-shine btn-hover-lift px-6 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50"
      >
        Continue
      </button>
    </div>
  );
}
