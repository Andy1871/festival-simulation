import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:   'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50',
    ghost:     'text-gray-600 hover:bg-gray-100 disabled:opacity-40',
};

const SIZE: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
        >
            {children}
        </button>
    );
}
