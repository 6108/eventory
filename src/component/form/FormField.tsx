// src/component/form/FormField.tsx
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}

export default function FormField({ label, children, hint, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1 text-sm text-zinc-400">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}