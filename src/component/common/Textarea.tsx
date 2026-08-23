import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className = "", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={`resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary ${className}`}
        {...props}
      />
    );
  }
);