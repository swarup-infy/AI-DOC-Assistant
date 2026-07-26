import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BubbleContentProps {
  message: string;
}

export default function BubbleContent({
  message,
}: BubbleContentProps) {
  return (
    <div
      className="
        rounded-2xl
        rounded-tl-md
        border
        border-border
        bg-card
        px-6
        py-5
        shadow-sm

        prose
        max-w-none
        prose-neutral
        dark:prose-invert

        prose-headings:font-semibold
        prose-headings:text-foreground

        prose-p:text-foreground
        prose-p:leading-7

        prose-strong:text-foreground

        prose-a:text-primary
        prose-a:no-underline
        hover:prose-a:underline

        prose-ul:my-4
        prose-ol:my-4

        prose-code:rounded
        prose-code:bg-muted
        prose-code:px-1.5
        prose-code:py-1
        prose-code:text-primary
        prose-code:before:content-none
        prose-code:after:content-none

        prose-pre:rounded-xl
        prose-pre:border
        prose-pre:border-border
        prose-pre:bg-muted
        prose-pre:text-foreground

        prose-blockquote:border-primary
        prose-blockquote:text-muted-foreground

        prose-table:border-collapse
        prose-th:border
        prose-th:border-border
        prose-td:border
        prose-td:border-border
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {message}
      </ReactMarkdown>
    </div>
  );
}