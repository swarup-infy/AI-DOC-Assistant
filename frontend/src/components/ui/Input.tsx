import {
  forwardRef,
  useId,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  endAdornment?: ReactNode;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon,
      endAdornment,
      error,
      hint,
      id,
      className,
      required,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const descriptionId = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    /*
     * Keep icon spacing explicit.
     *
     * This prevents global input styles or Tailwind utility conflicts
     * from causing the text to overlap the icons.
     */
    const inputStyle: CSSProperties = {
      ...style,
      paddingLeft: icon ? "3.5rem" : "1rem",
      paddingRight: endAdornment ? "3.5rem" : "1rem",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}

            {required && (
              <span
                className="ml-1 text-destructive"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        <div className="relative w-full">
          {/* Left icon */}
          {icon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-14 items-center justify-center text-muted-foreground"
            >
              {icon}
            </span>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            style={inputStyle}
            className={cn(
              "block h-14 w-full rounded-2xl",
              "border border-border",
              "bg-card/70 backdrop-blur-md",
              "text-base text-foreground",
              "placeholder:text-muted-foreground",
              "outline-none",
              "transition-all duration-200",
              "focus:border-primary",
              "focus:ring-4 focus:ring-primary/10",
              "disabled:cursor-not-allowed",
              "disabled:opacity-60",
              error &&
                "border-destructive focus:border-destructive focus:ring-destructive/10",
              className
            )}
            {...props}
          />

          {/* Right adornment */}
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 z-10 flex w-14 items-center justify-center">
              {endAdornment}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-2 text-xs text-destructive"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${inputId}-hint`}
            className="mt-2 text-xs text-muted-foreground"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;