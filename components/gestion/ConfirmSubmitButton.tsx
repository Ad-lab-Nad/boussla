"use client";

import { Trash2 } from "lucide-react";

export function ConfirmSubmitButton({
  confirmMessage,
  title = "Supprimer",
  children,
}: {
  confirmMessage: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className="g-del-btn"
      title={title}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children ?? <Trash2 size={15} />}
    </button>
  );
}
