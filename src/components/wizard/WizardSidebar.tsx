import { useState, useMemo } from 'react';
import { StatusDot } from '../ui';
import { useAuth } from '../../auth/AuthContext';
import { listSavedConfigs, saveConfig, deleteConfig } from '../../storage/configs';
import type { WizardStep, FestivalConfig } from '../../types';

const STEPS: Array<{ key: WizardStep; label: string; description: string }> = [
    { key: 'basic',      label: 'Basic Info',    description: 'Name, date & location'   },
    { key: 'site',       label: 'Site & Stages', description: 'Layout and stages'       },
    { key: 'lineup',     label: 'Lineup',        description: 'Artists and performers'  },
    { key: 'ticketing',  label: 'Ticketing',     description: 'Prices and tiers'        },
    { key: 'operations', label: 'Operations',    description: 'Vendors and staff'       },
    { key: 'review',     label: 'Overview',      description: 'Overview and export'     },
    { key: 'compare',    label: 'Compare',       description: 'Side-by-side comparison' },
];

interface WizardSidebarProps {
    currentStep:  WizardStep;
    errors:       Record<WizardStep, string[]>;
    warnings:     Record<WizardStep, string[]>;
    reviewHasRed: boolean;
    config:       FestivalConfig;
    onStepClick:  (step: WizardStep) => void;
    onReset:      () => void;
    onLoad:       (config: FestivalConfig) => void;
    onAfterSave:  (id: string, name: string) => void;
}

function SaveNameModal({
    initialName,
    onConfirm,
    onCancel,
}: {
    initialName: string;
    onConfirm: (name: string) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initialName);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Save Festival</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                </div>
                <div className="px-5 py-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Festival name</label>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') onConfirm(name); if (e.key === 'Escape') onCancel(); }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Unnamed festival"
                    />
                    <p className="text-xs text-gray-400 mt-2">Saving with a different name creates a new save file.</p>
                </div>
                <div className="flex gap-2 px-5 pb-4">
                    <button
                        onClick={() => onConfirm(name)}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function SavedModal({
    userId,
    currentConfig,
    onClose,
    onLoad,
}: {
    userId: string;
    currentConfig: FestivalConfig;
    onClose: () => void;
    onLoad: (config: FestivalConfig) => void;
}) {
    const [saved, setSaved] = useState(() => listSavedConfigs(userId));
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        deleteConfig(userId, id);
        setSaved(listSavedConfigs(userId));
        setConfirmDelete(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Saved Festivals</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                    {saved.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No saved festivals yet.</p>
                    ) : (
                        saved.map(entry => (
                            <div key={entry.id} className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 hover:bg-gray-50">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{entry.name}</p>
                                    <p className="text-xs text-gray-400">{new Date(entry.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                {confirmDelete === entry.id ? (
                                    <div className="flex gap-1">
                                        <button onClick={() => handleDelete(entry.id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700">Delete</button>
                                        <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { onLoad(entry.config); onClose(); }}
                                            disabled={entry.id === currentConfig.id}
                                            className="text-xs px-2 py-1 rounded bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Load
                                        </button>
                                        <button onClick={() => setConfirmDelete(entry.id)} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600">✕</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400">Saved festivals are stored in your browser only.</p>
                </div>
            </div>
        </div>
    );
}

export function WizardSidebar({ currentStep, errors, warnings, reviewHasRed, config, onStepClick, onReset, onLoad, onAfterSave }: WizardSidebarProps) {
    const { user, logout } = useAuth();
    const [confirming, setConfirming]         = useState(false);
    const [showModal, setShowModal]           = useState(false);
    const [showSaveModal, setShowSaveModal]   = useState(false);
    const [saveFlash, setSaveFlash]           = useState(false);

    const savedCount = useMemo(
        () => user ? listSavedConfigs(user.id).length : 0,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, saveFlash],
    );

    const doSave = (name: string) => {
        if (!user) return;
        const entry = saveConfig(user.id, config, name);
        onAfterSave(entry.id, entry.name);
        setShowSaveModal(false);
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 1500);
    };

    const handleSave = () => { if (user) setShowSaveModal(true); };

    const navItems = STEPS.map((step, i) => {
        const isCurrent  = step.key === currentStep;
        const isValid    = errors[step.key].length === 0;
        const hasWarning = isValid && warnings[step.key].length > 0;
        const dotStatus: 'invalid' | 'warning' | 'valid' = (step.key === 'review' && reviewHasRed)
            ? 'invalid'
            : !isValid ? 'invalid' : hasWarning ? 'warning' : 'valid';
        const numberBg   = isCurrent
            ? 'bg-purple-600 text-white'
            : step.key === 'compare'
            ? 'bg-blue-100 text-blue-600'
            : (step.key === 'review' && reviewHasRed)
            ? 'bg-red-100 text-red-600'
            : isValid && !hasWarning
            ? 'bg-green-100 text-green-700'
            : isValid && hasWarning
            ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-600';

        return { step, i, isCurrent, isValid, hasWarning, dotStatus, numberBg };
    });

    const ConfigControls = () => (
        confirming ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
                <p className="text-xs font-medium text-red-700 mb-2">Reset everything?</p>
                <div className="flex gap-2">
                    <button onClick={() => { onReset(); setConfirming(false); }} className="flex-1 py-1.5 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">Yes, reset</button>
                    <button onClick={() => setConfirming(false)} className="flex-1 py-1.5 rounded-md text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
            </div>
        ) : (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                <div className="flex gap-1.5">
                    <button
                        onClick={handleSave}
                        title="Save current festival"
                        className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md border transition-colors ${saveFlash ? 'border-green-300 text-green-600 bg-green-50' : 'text-gray-500 bg-white border-gray-200 hover:border-purple-300 hover:text-purple-600'}`}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                        </svg>
                        <span className="text-xs leading-none">{saveFlash ? 'Saved!' : 'Save'}</span>
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        title={`Load a saved festival (${savedCount} saved)`}
                        className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md text-gray-500 bg-white border border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span className="text-xs leading-none">Load{savedCount > 0 ? ` (${savedCount})` : ''}</span>
                    </button>
                    <button onClick={() => setConfirming(true)} title="Reset to blank" className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md text-gray-500 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                        </svg>
                        <span className="text-xs leading-none">Reset</span>
                    </button>
                </div>
            </div>
        )
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-white border-r border-gray-100 shrink-0 pb-14">
                <div className="px-6 py-6 border-b border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">Festival Sim</p>
                    <h1 className="text-lg font-semibold text-gray-900 mt-0.5">{config.name || 'New Festival'}</h1>
                </div>
                <nav className="py-4 flex-1 overflow-y-auto">
                    {navItems.map(({ step, i, isCurrent, dotStatus, numberBg }) => (
                        <div key={step.key}>
                            {step.key === 'compare' && (
                                <hr className="mx-6 my-2 border-gray-100" />
                            )}
                            <button
                                onClick={() => onStepClick(step.key)}
                                className={`w-full flex items-center gap-3 px-6 py-3.5 text-left transition-colors ${isCurrent ? 'bg-purple-50 border-r-2 border-purple-600' : 'hover:bg-gray-50'}`}
                            >
                                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${numberBg}`}>
                                    {step.key === 'compare' ? (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                                    ) : i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-purple-700' : 'text-gray-700'}`}>{step.label}</p>
                                    <p className="text-xs text-gray-400 truncate">{step.description}</p>
                                </div>
                                {step.key !== 'compare' && <StatusDot status={dotStatus} />}
                            </button>
                        </div>
                    ))}
                </nav>
                <div className="mx-6 mb-3">
                    <ConfigControls />
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span className="text-sm text-gray-600 font-medium truncate">{user?.username ?? 'Guest'}</span>
                    </div>
                    <button onClick={logout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                        <span>Sign out</span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Mobile top bar */}
            <div className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">Festival Sim</p>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} className={`text-xs px-2 py-1 rounded-md border transition-colors ${saveFlash ? 'border-green-300 text-green-600 bg-green-50' : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'}`}>
                            {saveFlash ? 'Saved!' : 'Save'}
                        </button>
                        <button onClick={() => setShowModal(true)} className="text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors">
                            Load{savedCount > 0 ? ` (${savedCount})` : ''}
                        </button>
                        <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
                    </div>
                </div>
                <nav className="grid grid-cols-4 gap-1.5 px-4 pb-3">
                    {STEPS.map((step) => {
                        const isCurrent  = step.key === currentStep;
                        const isValid    = errors[step.key].length === 0;
                        const hasWarning = isValid && warnings[step.key].length > 0;
                        const dotStatus  = !isValid ? 'invalid' : hasWarning ? 'warning' : 'valid';
                        return (
                            <button
                                key={step.key}
                                onClick={() => onStepClick(step.key)}
                                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${isCurrent ? 'bg-purple-600 text-white' : step.key === 'compare' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <span className="truncate">{step.label}</span>
                                {!isCurrent && step.key !== 'compare' && <StatusDot status={dotStatus} />}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {showModal && user && (
                <SavedModal
                    userId={user.id}
                    currentConfig={config}
                    onClose={() => setShowModal(false)}
                    onLoad={onLoad}
                />
            )}
            {showSaveModal && (
                <SaveNameModal
                    initialName={config.name}
                    onConfirm={doSave}
                    onCancel={() => setShowSaveModal(false)}
                />
            )}
        </>
    );
}
