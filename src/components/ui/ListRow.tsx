import type { ReactNode } from 'react';

interface ListRowProps {
    children: ReactNode;
    right?: ReactNode;
    onEdit?: () => void;
    onRemove: () => void;
    className?: string;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const BinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
);

export function ListRow({ children, right, onEdit, onRemove, className = 'bg-gray-50' }: ListRowProps) {
    return (
        <div className={`flex items-center justify-between ${className} rounded-lg px-3 py-2.5`}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {children}
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
                {right}
                {onEdit && (
                    <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors" title="Edit">
                        <EditIcon />
                    </button>
                )}
                <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition-colors" title="Remove">
                    <BinIcon />
                </button>
            </div>
        </div>
    );
}
