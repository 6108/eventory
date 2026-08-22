"use client";

import { useConfirmModalStore } from "@/src/store/confirmModalStore";
import { Modal } from "./Modal";

export default function ConfirmModal() {
  const { isOpen, title, message, confirmText, cancelText, handleConfirm, handleCancel } =
    useConfirmModalStore();

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} maxWidth="xs">
      <div className="text-center">
        <p className="text-base text-zinc-200 mb-1">{title}</p>
        {message && <p className="text-sm text-zinc-500 mb-6">{message}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-md py-2 text-sm text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            {cancelText ?? "취소"}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-md py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/80 transition-colors"
          >
            {confirmText ?? "확인"}
          </button>
        </div>
      </div>
    </Modal>
  );
}