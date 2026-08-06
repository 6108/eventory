type SubCategoryChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export default function SubCategoryChip({
  label,
  active,
  onClick,
}: SubCategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium  ${active
        ? "border-primary bg-primary text-zinc-100 font-bold"
        : " bg-zinc-200/500 text-zinc-200"
        }`}
    >
      {label}
    </button>
  );
}