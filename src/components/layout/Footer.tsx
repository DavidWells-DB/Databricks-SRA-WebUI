export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-6 py-6 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-tertiary)]">
        {/* Branding */}
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span>Databricks Security Reference Architecture</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          <a href="https://databricks.github.io/terraform-databricks-sra/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-secondary)] transition-colors">
            SRA Docs
          </a>
          <span className="text-[var(--color-border)]">|</span>
          <a href="https://github.com/databricks/terraform-databricks-sra" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-secondary)] transition-colors">
            GitHub
          </a>
          <span className="text-[var(--color-border)]">|</span>
          <a href="https://www.databricks.com/trust/security-features" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-secondary)] transition-colors">
            Security Best Practices
          </a>
        </div>

        {/* Built with */}
        <div>
          Everything runs in your browser
        </div>
      </div>
    </footer>
  );
}
