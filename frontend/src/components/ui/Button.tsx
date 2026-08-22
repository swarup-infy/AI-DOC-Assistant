import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  ghost: "bg-transparent text-foreground hover:bg-accent",
  outline: "border border-border bg-card text-foreground hover:bg-accent",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled = false, fullWidth = false, iconLeft, iconRight, className, children, type = "button", ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
          "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          SIZE_CLASSES[size],
          VARIANT_CLASSES[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : iconLeft ? <span className="flex items-center" aria-hidden="true">{iconLeft}</span> : null}
        {children ? <span className="truncate">{children}</span> : null}
        {!loading && iconRight ? <span className="flex items-center" aria-hidden="true">{iconRight}</span> : null}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
