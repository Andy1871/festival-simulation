import type { ReactNode } from 'react';
import { StatusDot } from './StatusDot';

interface FormFieldProps {
    label: string;
    isValid?: boolean;
    hint?: string;
    warning?: string;
    children: ReactNode;
}

export function FormField({ label, isValid, hint, warning, children }: FormFieldProps) {
    const dotStatus = isValid === undefined ? 'neutral' : isValid ? 'valid' : 'invalid';

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {isValid !== undefined && <StatusDot status={dotStatus} />}
            </div>
            {children}
            {warning && <p className="text-xs text-amber-600">{warning}</p>}
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
    );
}
