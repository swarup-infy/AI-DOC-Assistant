import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BubbleContentProps {
  message: string;
}

function BubbleContent({ message }: BubbleContentProps) {
  return (
    <article
      className="
        animate-in fade-in duration-300
        rounded-3xl
        border border-border/60
        bg-card
        px-7 py-6
        shadow-sm

        prose
        max-w-none
        prose-neutral
        dark:prose-invert

        prose-headings:mb-4
        prose-headings:mt-6
        prose-headings:font-semibold
        prose-headings:text-foreground

        prose-p:my-4
        prose-p:leading-8
        prose-p:text-foreground

        prose-strong:font-semibold
        prose-strong:text-foreground

        prose-em:text-foreground

        prose-a:text-primary
        prose-a:no-underline
        hover:prose-a:underline

        prose-ul:my-5
        prose-ol:my-5
        prose-li:my-1

        prose-hr:my-8
        prose-hr:border-border

        prose-blockquote:rounded-r-xl
        prose-blockquote:border-l-4
        prose-blockquote:border-primary
        prose-blockquote:bg-muted/40
        prose-blockquote:px-4
        prose-blockquote:py-2
        prose-blockquote:italic
        prose-blockquote:text-muted-foreground

        prose-code:rounded-md
        prose-code:bg-muted
        prose-code:px-1.5
        prose-code:py-1
        prose-code:text-primary
        prose-code:font-medium
        prose-code:before:content-none
        prose-code:after:content-none

        prose-pre:overflow-x-auto
        prose-pre:rounded-2xl
        prose-pre:border
        prose-pre:border-border
        prose-pre:bg-muted
        prose-pre:p-5
        prose-pre:text-sm
        prose-pre:shadow-inner

        prose-table:block
        prose-table:w-full
        prose-table:overflow-x-auto

        prose-th:border
        prose-th:border-border
        prose-th:bg-muted
        prose-th:px-4
        prose-th:py-2
        prose-th:text-left

        prose-td:border
        prose-td:border-border
        prose-td:px-4
        prose-td:py-2

        prose-img:rounded-xl
        prose-img:border
        prose-img:border-border
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),

          code: ({ className, children, ...props }) => (
            <code
              className={className}
              {...props}
            >
              {children}
            </code>
          ),

          img: ({ node, ...props }) => (
            <img
              loading="lazy"
              decoding="async"
              alt={props.alt ?? ""}
              {...props}
            />
          ),
        }}
      >
        {message}
      </ReactMarkdown>
    </article>
  );
}

export default memo(BubbleContent);