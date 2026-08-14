// src/component/form/FormField.tsx
type Props = {
  label: string;
  children: React.ReactNode;
  hint?: string;
};

export function FormField({ label, children, hint }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-zinc-400">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}