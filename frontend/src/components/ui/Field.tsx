/** Form control primitives — identical field chrome everywhere.
 * `Field` wraps a label + control; Input/Textarea/Select carry the styling. */

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const controlClass =
  "w-full rounded-xl border border-white/10 bg-ink-850 px-3.5 py-2.5 text-sm text-mist-100 placeholder:text-mist-500 transition-colors hover:border-white/20 focus:border-brand-500/60 focus:bg-ink-800 focus:outline-none";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-bold tracking-wide text-mist-400 uppercase"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-mist-500">{hint}</p>}
    </div>
  );
}

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClass} ${className}`} {...rest} />;
}

export function Textarea({
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${controlClass} resize-none ${className}`}
      {...rest}
    />
  );
}

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${controlClass} ${className}`} {...rest}>
      {children}
    </select>
  );
}
