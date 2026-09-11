"use client";

export function ConfirmSubmitButton({
  confirmMessage,
  title = "Supprimer",
  children = "✕",
}: {
  confirmMessage: string;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className="del-btn"
      title={title}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
