"use client";

import { ReactNode, useRef } from "react";
import { X } from "lucide-react";

type ActionModalProps = {
  label: string;
  title: string;
  eyebrow?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  triggerClassName?: string;
};

export function ActionModal({
  label,
  title,
  eyebrow,
  description,
  icon,
  children,
  triggerClassName = "add-summary",
}: ActionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openDialog}>
        {icon ? <span className="modal-trigger-icon">{icon}</span> : null}
        {label}
      </button>

      <dialog
        ref={dialogRef}
        className="action-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDialog();
          }
        }}
      >
        <div className="action-modal-card">
          <div className="action-modal-header">
            <div>
              {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
              <h2>{title}</h2>
              {description ? <p>{description}</p> : null}
            </div>

            <button
              type="button"
              className="modal-close"
              aria-label="Close dialog"
              onClick={closeDialog}
            >
              <X size={20} />
            </button>
          </div>

          <div className="action-modal-body">{children}</div>
        </div>
      </dialog>
    </>
  );
}
