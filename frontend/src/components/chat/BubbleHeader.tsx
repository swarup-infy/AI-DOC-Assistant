interface BubbleHeaderProps {
  title: string;
}

export default function BubbleHeader({
  title,
}: BubbleHeaderProps) {
  return (
    <div className="flex items-center">
      <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
        {title}
      </span>
    </div>
  );
}