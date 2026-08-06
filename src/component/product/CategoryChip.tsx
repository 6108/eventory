type CategoryChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export default function CategoryChip({
  label,
  active,
  onClick,
}: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-3 py-2 text-base font-bold ${active
        ? "border-primary text-primary"
        : "border-transparent text-zinc-300"
        }`}
    >
      {label}
    </button>
  );
}
