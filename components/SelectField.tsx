interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-mint/70 focus:ring-4 focus:ring-mint/10"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-ink text-white">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
