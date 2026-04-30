import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-lg">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Branding — links to landing page */}
        <Link
          to="/"
          aria-label="Databricks SRA — home"
          className="flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {/* Shield icon */}
          <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-lg font-bold">
            <span className="text-[var(--color-primary)]">Databricks</span>
            <span className="text-[var(--color-text)]"> SRA</span>
          </span>
        </Link>

        {/* Right side: GitHub + theme toggle */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/databricks/terraform-databricks-sra"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.082z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
