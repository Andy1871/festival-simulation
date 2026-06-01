import { useState, type SubmitEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';

export function LoginPage() {
    const { login, register } = useAuth();
    const [mode, setMode]       = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail]     = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]     = useState<string | null>(null);

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const err = mode === 'login'
            ? login(email, password)
            : register(username, email, password);
        if (err) setError(err);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-1">Festival Sim</p>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {mode === 'login' ? 'Sign in' : 'Create account'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {mode === 'login'
                            ? 'Welcome back'
                            : 'Create a local profile to save and compare festival designs.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
                    {mode === 'register' && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Your name"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                                required
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                        {mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                        className="text-purple-600 font-medium hover:text-purple-700"
                    >
                        {mode === 'login' ? 'Create one' : 'Sign in'}
                    </button>
                </p>

                <p className="text-center text-xs text-gray-400 mt-6">
                    All data is stored locally in your browser only.
                </p>
            </div>
        </div>
    );
}
