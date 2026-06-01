export function Row({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
    return (
        <div className="flex items-baseline justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="text-right">
                <span className={`text-sm font-semibold ${valueColor ?? 'text-gray-800'}`}>{value}</span>
                {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
        </div>
    );
}
