import { useState } from 'react';

interface MapEditorProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
  /** When provided, restricts keys to this fixed set and renders the new-key input as a select */
  keyOptions?: { value: string; label: string; hint?: string }[];
}

export default function MapEditor({
  value,
  onChange,
  disabled = false,
  keyOptions,
}: MapEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const entries = Object.entries(value);
  const usedKeys = new Set(entries.map(([k]) => k));
  const availableKeyOptions = keyOptions?.filter((opt) => !usedKeys.has(opt.value)) ?? [];
  const activeHint = keyOptions?.find((opt) => opt.value === newKey)?.hint;

  const handleRemove = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  const handleAdd = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey) return;
    onChange({ ...value, [trimmedKey]: newValue });
    setNewKey('');
    setNewValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const keyLabel = (k: string) =>
    keyOptions?.find((opt) => opt.value === k)?.label ?? k;

  return (
    <div className="space-y-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <input
            type="text"
            value={keyLabel(k)}
            readOnly
            className="w-2/5 rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-[var(--color-text)] opacity-80"
          />
          <span className="text-[var(--color-text-secondary)]">=</span>
          <input
            type="text"
            value={v}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
            disabled={disabled}
            className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => handleRemove(k)}
            disabled={disabled}
            className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Remove ${k}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {keyOptions ? (
            <select
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              disabled={disabled || availableKeyOptions.length === 0}
              className="w-2/5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {availableKeyOptions.length === 0 ? 'All keys added' : 'Select a key…'}
              </option>
              {availableKeyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Key"
              disabled={disabled}
              className="w-2/5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            />
          )}
          <span className="text-[var(--color-text-secondary)]">=</span>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Value"
            disabled={disabled}
            className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled || !newKey.trim()}
            className="rounded bg-[var(--color-surface-tertiary)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {activeHint && (
          <p className="text-xs text-[var(--color-text-secondary)] pl-1">{activeHint}</p>
        )}
      </div>
    </div>
  );
}
