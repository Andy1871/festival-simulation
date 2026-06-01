export type CheckStatus = 'green' | 'amber' | 'red';

export function ChecklistItem({ label, status, detail, sub }: { label: string; status: CheckStatus; detail: string; sub?: string | string[] }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
            {status === 'green' ? (
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
            ) : status === 'amber' ? (
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
            )}
            <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
            <div className="text-right">
                <span className="text-sm text-gray-500">{detail}</span>
                {Array.isArray(sub)
                    ? sub.map((s, i) => <p key={i} className="text-xs text-gray-400">{s}</p>)
                    : sub && <p className="text-xs text-gray-400">{sub}</p>
                }
            </div>
        </div>
    );
}
