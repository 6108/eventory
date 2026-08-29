// src/component/form/FormActions.tsx
interface FormActionsProps {
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
}

export default function FormActions({
  onCancel,
  loading,
  submitLabel,
  loadingLabel,
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
      >
        취소
      </button>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? loadingLabel : submitLabel}
      </button>
    </div>
  );
}