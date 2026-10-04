"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/** Password field with a show/hide toggle (eye icon) inside the input. */
export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="g-password-wrap">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="g-password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
