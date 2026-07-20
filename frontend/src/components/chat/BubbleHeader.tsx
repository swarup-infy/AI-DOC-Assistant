interface BubbleHeaderProps {
    title: string;
    copied: boolean;
    onCopy: () => void;
}

export default function BubbleHeader({
    title,
    copied,
    onCopy,
}: BubbleHeaderProps) {

    return (
        <div className="mb-3 flex items-center justify-between">

            <span className="
                rounded-full
                bg-slate-900
                px-3
                py-1
                text-xs
                font-semibold
                tracking-wide
                text-white
            ">
                {title}
            </span>

            <button
                onClick={onCopy}
                className="
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-1.5
                    text-sm
                    transition-all
                    duration-200
                    hover:bg-gray-100
                    hover:shadow-md
                "
            >
                {copied ? "✅ Copied" : "📋 Copy"}
            </button>

        </div>
    );
}