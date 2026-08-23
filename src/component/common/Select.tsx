import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});