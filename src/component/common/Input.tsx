interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function Input({ ...props }: InputProps) {
  return <input className="w-full h-10 px-3 border rounded-md text-sm outline-none" {...props} />
}