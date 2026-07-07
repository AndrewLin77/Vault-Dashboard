import { useEffect, useId, useRef, useState } from 'react';

function ChevronIcon() {
  return (
    <svg className="filter-dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Dark-themed dropdown for vault list sort and filter controls. */
export default function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon,
  iconOnly = false,
  active = false,
  menuAlign = 'right',
  placeholder,
  placeholderValue = 'all',
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listboxId = useId();
  const selected = options.find((option) => option.id === value);
  const triggerLabel = value === placeholderValue && placeholder
    ? placeholder
    : (selected?.label ?? label);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div
      className={`filter-dropdown ${open ? 'is-open' : ''} filter-dropdown-align-${menuAlign}`}
      ref={rootRef}
    >
      <button
        type="button"
        className={`filter-dropdown-trigger ${iconOnly ? 'filter-dropdown-trigger-icon' : ''} ${active ? 'active' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={iconOnly ? label : undefined}
      >
        {icon}
        {!iconOnly ? <span className="filter-dropdown-trigger-label">{triggerLabel}</span> : null}
        {!iconOnly ? <ChevronIcon /> : null}
      </button>

      {open ? (
        <ul className="filter-dropdown-menu" id={listboxId} role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option.id} role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === option.id}
                className={`filter-dropdown-option ${value === option.id ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
