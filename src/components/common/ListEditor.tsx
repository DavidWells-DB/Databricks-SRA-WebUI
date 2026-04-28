import { useState } from 'react';

interface ListEditorProps {
  value: any[];
  onChange: (value: any[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ListEditor({
  value,
  onChange,
  placeholder = 'Type and press Enter to add',
  disabled = false,
}: ListEditorProps) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-tertiary)] px-2.5 py-1 text-sm text-[var(--color-text)]"
            >
              {String(item)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-0.5 rounded-full p-0.5 text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                  aria-label={`Remove ${String(item)}`}
                >
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !input.trim()}
          className="rounded bg-[var(--color-surface-tertiary)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>
    </div>
  );
}
