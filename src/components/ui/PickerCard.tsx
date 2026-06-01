interface PickerCardProps {
    label:        string;
    description?: string;
    countText?:   string;
    isActive:     boolean;
    colorClass:   string;
    onClick:      () => void;
    disabled?:    boolean;
}

export function PickerCard({ label, description, countText, isActive, colorClass, onClick, disabled }: PickerCardProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                    ? 'border-purple-400 ring-1 ring-purple-300 ' + colorClass
                    : colorClass + ' hover:opacity-80'
            }`}
        >
            <span className="text-sm font-semibold text-gray-800 leading-tight">{label}</span>
            {description && <span className="text-xs text-gray-500 mt-0.5 leading-tight">{description}</span>}
            {countText !== undefined && <span className="text-xs text-purple-500 mt-1">{countText}</span>}
        </button>
    );
}
