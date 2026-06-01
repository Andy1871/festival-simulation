import { useState } from 'react';

const sectionOpenState = new Map<string, boolean>();

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(() => sectionOpenState.get(title) ?? true);

    const toggle = () => {
        const next = !isOpen;
        sectionOpenState.set(title, next);
        setIsOpen(next);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <button
                onClick={toggle}
                className={`w-full flex items-center justify-between text-left cursor-pointer ${isOpen ? 'mb-4' : ''}`}
            >
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-3 ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && children}
        </div>
    );
}
