import { User } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { name: string; email: string }) => Promise<void>;
    setAuthData: (token: string, user: User) => void;
    loading: boolean;
    isAuthenticated: boolean;
    loggingOut: boolean;
    setIntendedUrl: (url: string) => void;
    getIntendedUrl: () => string | null;
    clearIntendedUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [intendedUrl, setIntendedUrl] = useState<string | null>(null);

    const apiCall = async (url: string, options: RequestInit = {}) => {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${baseUrl}/api${url}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error' }));

            // If we have validation errors, create a custom error object
            if (errorData.errors) {
                const validationError = new Error('Validation failed');
                // Laravel returns errors as arrays, convert to strings for easier handling
                const formattedErrors: Record<string, string> = {};
                Object.keys(errorData.errors).forEach((key) => {
                    const errorArray = errorData.errors[key];
                    formattedErrors[key] = Array.isArray(errorArray) ? errorArray[0] : errorArray;
                });
                (validationError as any).errors = formattedErrors;
                throw validationError;
            }

            throw new Error(errorData.message || 'Request failed');
        }

        return response.json();
    };

    const fetchUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await apiCall('/user');
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('auth_token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await apiCall('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            const { token: newToken, user: userData } = response;
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('auth_token', newToken);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
        setLoading(true);
        try {
            const response = await apiCall('/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const { token: newToken, user: userData } = response;
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('auth_token', newToken);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setLoggingOut(true);

        if (token) {
            try {
                await apiCall('/logout', { method: 'POST' });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        setLoggingOut(false);
    };

    const updateProfile = async (data: { name: string; email: string }) => {
        const response = await apiCall('/profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        setUser(response.user);
    };

    const setAuthData = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('auth_token', newToken);
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, [token]);

    const value = {
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        setAuthData,
        loading,
        isAuthenticated: !!user && !loggingOut,
        loggingOut,
        setIntendedUrl: (url: string) => setIntendedUrl(url),
        getIntendedUrl: () => intendedUrl,
        clearIntendedUrl: () => setIntendedUrl(null),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
