// src/component/auth/UserMenuSection.tsx
type Props = {
  label: string;
  children: React.ReactNode;
};

export default function UserMenuSection({ label, children }: Props) {
  return (
    <div>
      <p className="px-4 pt-1.5 pb-1 text-sm font-medium uppercase tracking-wide text-zinc-600">
        {label}
      </p>
      {children}
    </div>
  );
}