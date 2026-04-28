import { useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: string;
}

export default function CollapsibleSection({ title, icon, defaultOpen = false, children, badge }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-[var(--color-text)]">{title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]">
              {badge}
            </span>
          )}
        </div>
        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-[var(--color-text-secondary)] chevron-icon ${isOpen ? 'rotated' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 py-4 bg-[var(--color-surface)] space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
