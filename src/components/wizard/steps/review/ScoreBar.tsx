export function ScoreBar({ label, score }: { label: string; score: number }) {
    const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-medium text-gray-700 w-8 text-right">{score}</span>
        </div>
    );
}
