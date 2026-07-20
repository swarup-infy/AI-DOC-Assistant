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
                border-gray-200
                bg-white
                px-6
                py-5
                shadow-sm

                prose
                prose-slate
                max-w-none

                prose-headings:font-bold
                prose-headings:text-slate-900

                prose-p:leading-8
                prose-p:text-gray-700

                prose-ul:list-disc
                prose-ol:list-decimal

                prose-li:my-2

                prose-strong:text-black

                prose-code:rounded
                prose-code:bg-gray-100
                prose-code:px-1.5
                prose-code:py-1

                prose-pre:bg-slate-900
                prose-pre:text-white
                prose-pre:rounded-xl
            "
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message}
            </ReactMarkdown>
        </div>
    );
}