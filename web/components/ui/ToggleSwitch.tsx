"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export default function ToggleSwitch({ checked, onChange, id }: ToggleSwitchProps) {
  const toggleId = id || `toggle-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        checked={checked}
        id={toggleId}
        type="checkbox"
        onChange={(e) => onChange(e.target.checked)}
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10"
      />
      <label htmlFor={toggleId} className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-container cursor-pointer border border-outline-variant/50" />
    </div>
  );
}
