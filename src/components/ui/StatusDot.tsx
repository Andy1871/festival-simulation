interface StatusDotProps {
    status: 'valid' | 'invalid' | 'warning' | 'neutral';
    size?: 'sm' | 'md';
}

export function StatusDot({ status, size = 'sm' }: StatusDotProps) {
    const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
    const colorClass =
        status === 'valid'   ? 'bg-green-500' :
        status === 'invalid' ? 'bg-red-400'   :
        status === 'warning' ? 'bg-amber-400' :
                               'bg-gray-300';
    return <span className={`inline-block rounded-full shrink-0 ${sizeClass} ${colorClass}`} />;
}
