import { useState } from 'react';
import type { ReactNode } from 'react';

interface SectionCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

const openState = new Map<string, boolean>();

export function SectionCard({ title, description, children }: SectionCardProps) {
    const [isOpen, setIsOpen] = useState(() => openState.get(title) ?? true);

    const toggle = () => {
        const next = !isOpen;
        openState.set(title, next);
        setIsOpen(next);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <button
                onClick={toggle}
                className={`w-full flex items-center justify-between text-left cursor-pointer ${isOpen ? 'mb-5' : ''}`}
            >
                <div>
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-3 ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="flex flex-col gap-5">
                    {children}
                </div>
            )}
        </div>
    );
}
