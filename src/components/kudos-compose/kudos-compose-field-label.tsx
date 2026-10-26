interface FieldLabelProps {
  children: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

/** mm:416:5550 — 22px bold label with optional red asterisk. */
export function ComposeFieldLabel({ children, required = false, htmlFor, className = "" }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={`flex shrink-0 items-center gap-0.5 text-[22px] leading-7 font-bold text-[#00101A] ${className}`}>
      {children}
      {required && (
        <span aria-hidden className="self-start pt-1 text-base leading-5 font-bold text-[#CF1322]">
          *
        </span>
      )}
    </label>
  );
}

/** Red inline error under a field. */
export function ComposeFieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm leading-5 font-bold text-[#CF1322]">
      {message}
    </p>
  );
}

export const FIELD_BORDER = "border-[#998C5F]";
export const FIELD_ERROR_BORDER = "border-[#CF1322]";
