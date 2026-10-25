"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  variant?: "store" | "admin";
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Konfirmasi destruktif memakai <dialog> native supaya fokus, Escape, dan
 * lapisan backdrop ditangani browser tanpa library tambahan.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  busy = false,
  variant = "store",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      data-variant={variant}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClose={() => {
        if (open && !busy) onCancel();
      }}
      onClick={(event) => {
        if (busy) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const outside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom;

        if (outside) onCancel();
      }}
    >
      <div className="flex items-start gap-3">
        <span className="confirm-dialog__icon" aria-hidden="true">
          <AlertTriangle size={18} strokeWidth={1.8} />
        </span>

        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <p id={descriptionId} className="mt-2 text-[13px] leading-6 text-ink-soft">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="confirm-dialog__cancel"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="confirm-dialog__confirm"
        >
          {busy ? "Memproses…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
