import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  required?: boolean;
  autoComplete?: string;
}

function PasswordInput({
  label,
  placeholder,
  register,
  required = true,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
      </div>

      <div className="relative mt-2">
        <input
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 pr-14 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          placeholder={placeholder}
          {...register}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-3 flex items-center rounded-full px-2 text-slate-300 transition hover:text-cyan-300"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <Eye />
          ) : (
            <EyeClosed />
          )}
        </button>
      </div>
    </label>
  );
}

export default PasswordInput;
