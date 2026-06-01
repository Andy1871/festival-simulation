import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

interface AuthContextValue {
    user: UserProfile | null;
    login:    (email: string, password: string) => string | null;
    register: (username: string, email: string, password: string) => string | null;
    logout:   () => void;
}

const LS_USERS   = 'festival_sim_users';
const LS_SESSION = 'festival_sim_session';

function getStoredUsers(): Array<UserProfile & { passwordHash: string }> {
    try { return JSON.parse(localStorage.getItem(LS_USERS) ?? '[]'); }
    catch { return []; }
}

function saveUsers(users: Array<UserProfile & { passwordHash: string }>) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function getSessionUserId(): string | null {
    return localStorage.getItem(LS_SESSION);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const id = getSessionUserId();
        if (!id) return null;
        const u = getStoredUsers().find(u => u.id === id);
        if (!u) return null;
        const { passwordHash: _, ...profile } = u;
        return profile;
    });

    const login = (email: string, password: string): string | null => {
        const users = getStoredUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!found) return 'No account found with that email.';
        if (found.passwordHash !== password) return 'Incorrect password.';
        const { passwordHash: _, ...profile } = found;
        localStorage.setItem(LS_SESSION, profile.id);
        setUser(profile);
        return null;
    };

    const register = (username: string, email: string, password: string): string | null => {
        if (!username.trim()) return 'Username is required.';
        if (!email.trim() || !email.includes('@')) return 'A valid email is required.';
        if (password.length < 4) return 'Password must be at least 4 characters.';
        const users = getStoredUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return 'An account with that email already exists.';
        const profile: UserProfile = { id: crypto.randomUUID(), username: username.trim(), email: email.trim().toLowerCase(), createdAt: new Date().toISOString() };
        saveUsers([...users, { ...profile, passwordHash: password }]);
        localStorage.setItem(LS_SESSION, profile.id);
        setUser(profile);
        return null;
    };

    const logout = () => {
        localStorage.removeItem(LS_SESSION);
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
