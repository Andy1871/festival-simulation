interface ToggleProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                    checked ? 'bg-purple-600' : 'bg-gray-200'
                }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
            {label && (
                <span className="text-sm text-gray-700 select-none">{checked ? 'Yes' : 'No'}</span>
            )}
        </div>
    );
}
