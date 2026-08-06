import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "../../lib/utils";

type CardVariant =
  | "surface"
  | "glass"
  | "outline";

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
}

const variants: Record<CardVariant, string> = {
  surface:
    "rounded-3xl border border-border bg-card text-card-foreground shadow-sm",

  glass:
    "rounded-3xl border border-border/50 bg-card/70 text-card-foreground backdrop-blur-2xl shadow-2xl",

  outline:
    "rounded-3xl border border-border bg-transparent text-card-foreground",
};

const Card = forwardRef<
  HTMLDivElement,
  CardProps
>(
  (
    {
      variant = "surface",
      hoverable = false,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        "overflow-hidden transition-all duration-300",
        hoverable &&
          "cursor-pointer hover:-translate-y-1 hover:shadow-2xl",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

export default Card;

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 p-6",
      className
    )}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-2xl font-bold tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

export const CardDescription =
  forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
  >(({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  ));

CardDescription.displayName =
  "CardDescription";

export const CardContent =
  forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
  >(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "p-6 pt-0",
        className
      )}
      {...props}
    />
  ));

CardContent.displayName =
  "CardContent";

export const CardFooter =
  forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
  >(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 p-6 pt-0",
        className
      )}
      {...props}
    />
  ));

CardFooter.displayName =
  "CardFooter";