import { useState } from "react";

export default function Modal({
  children,
  onClose,
}: {
  children: any;
  onClose: any;
}) {
  return (
    <div className="modal is-active">
      <div onClick={onClose} className="modal-background"></div>
      <div className="modal-content h-3/6">{children}</div>
      <button
        onClick={onClose}
        className="modal-close is-large"
        aria-label="close"></button>
    </div>
  );
}
