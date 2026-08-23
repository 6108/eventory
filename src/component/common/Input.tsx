import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary disabled:opacity-40 ${className}`}
      {...props}
    />
  );
});