import { memo } from "react";

interface BubbleHeaderProps {
  title: string;
  className?: string;
}

function BubbleHeader({
  title,
  className = "",
}: BubbleHeaderProps) {
  return (
    <header
      className={`flex items-center ${className}`}
      aria-label="Message header"
    >
      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-primary
          px-3
          py-1
          text-xs
          font-semibold
          tracking-wide
          text-primary-foreground
          select-none
        "
      >
        {title}
      </span>
    </header>
  );
}

export default memo(BubbleHeader);