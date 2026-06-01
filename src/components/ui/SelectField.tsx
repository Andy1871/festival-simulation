import type { ReactNode } from 'react';
import { StatusDot } from './StatusDot';

interface SelectFieldProps {
    label: string;
    isValid?: boolean;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}

export function SelectField({ label, isValid, value, onChange, children }: SelectFieldProps) {
    const dotStatus = isValid === undefined ? 'neutral' : isValid ? 'valid' : 'invalid';
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {isValid !== undefined && <StatusDot status={dotStatus} />}
            </div>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
            >
                {children}
            </select>
        </div>
    );
}
