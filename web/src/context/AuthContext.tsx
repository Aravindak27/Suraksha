import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface User {
    _id: string; // MongoDB ID
    name: string;
    email: string;
    phone: string;
    age?: number;
    emergencyContacts: Contact[];
}

interface Contact {
    id?: string; // MongoDB ID might not be available for local optimistic UI
    name: string;
    phone: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (details: Partial<User>) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('suraksha_token'));

    useEffect(() => {
        const savedToken = localStorage.getItem('suraksha_token');
        if (savedToken) {
            setToken(savedToken);
            fetchProfile(savedToken);
        }
    }, []);

    const fetchProfile = async (jwt: string) => {
        try {
            const res = await fetch('http://10.12.98.111:5000/api/profile', {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                logout();
            }
        } catch (err) {
            console.error(err);
            logout();
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('http://10.12.98.111:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setToken(data.token);
                setUser(data.result);
                localStorage.setItem('suraksha_token', data.token);
                return true;
            }
            alert(data.message || 'Login Failed');
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const signup = async (name: string, email: string, phone: string, password: string) => {
        try {
            const res = await fetch('http://10.12.98.111:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });
            const data = await res.json();
            if (res.ok) {
                setToken(data.token);
                setUser(data.result);
                localStorage.setItem('suraksha_token', data.token);
                return true;
            }
            alert(data.message || 'Signup Failed');
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('suraksha_token');
    };

    const updateProfile = async (details: Partial<User>) => {
        if (!token) return;
        try {
            const res = await fetch('http://10.12.98.111:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(details)
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, updateProfile, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
