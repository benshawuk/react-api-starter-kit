import { authenticatedFetch, getCsrfToken, getCsrfTokenFromCookie } from '@/lib/auth-utils';
import { User } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: { name: string; email: string }) => Promise<void>;
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
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [intendedUrl, setIntendedUrl] = useState<string | null>(null);

    // API call helper for session-based authentication
    const apiCall = async (url: string, options: RequestInit = {}) => {
        const response = await authenticatedFetch(url, options);

        if (!response.ok) {
            if (response.status === 204) return null;

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

        if (response.status === 204) return null;
        return response.json();
    };

    // Fetch user data
    const fetchUser = async (silent = false) => {
        if (!silent) setLoading(true);

        try {
            const userData = await apiCall('/api/user');
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            // Get CSRF token first
            await getCsrfToken();

            // Small delay to ensure cookie is set
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Get the token from cookie
            const csrfToken = getCsrfTokenFromCookie();

            // Login request using FormData (not JSON!)
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const loginResult = await fetch('/login', {
                // Web route, not /api/login
                method: 'POST',
                body: formData, // FormData, not JSON
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
                },
            });

            if (!loginResult.ok) {
                console.error('Login failed with status:', loginResult.status); // Debug log

                let errorData;
                try {
                    errorData = await loginResult.json();
                } catch {
                    errorData = { message: `Login failed with status ${loginResult.status}` };
                }

                console.error('Error data:', errorData); // Debug log

                // Handle specific 419 CSRF error
                if (loginResult.status === 419) {
                    throw new Error('CSRF token mismatch. Please refresh the page and try again.');
                }

                // Handle validation errors
                if (errorData.errors) {
                    const validationError = new Error('Validation failed');
                    const formattedErrors: Record<string, string> = {};
                    Object.keys(errorData.errors).forEach((key) => {
                        const errorArray = errorData.errors[key];
                        formattedErrors[key] = Array.isArray(errorArray) ? errorArray[0] : errorArray;
                    });
                    (validationError as any).errors = formattedErrors;
                    throw validationError;
                }

                throw new Error(errorData.message || 'Login failed');
            }

            // Fetch user data after successful login
            await fetchUser();
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
        setLoading(true);
        try {
            // Get CSRF token first
            await getCsrfToken();

            // Register request using FormData
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('password_confirmation', passwordConfirmation);

            const registerResult = await fetch('/register', {
                // Web route, not /api/register
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCsrfTokenFromCookie() || '',
                },
            });

            if (!registerResult.ok) {
                let errorData;
                try {
                    errorData = await registerResult.json();
                } catch {
                    errorData = { message: 'Registration failed' };
                }

                // Handle validation errors
                if (errorData.errors) {
                    const validationError = new Error('Validation failed');
                    const formattedErrors: Record<string, string> = {};
                    Object.keys(errorData.errors).forEach((key) => {
                        const errorArray = errorData.errors[key];
                        formattedErrors[key] = Array.isArray(errorArray) ? errorArray[0] : errorArray;
                    });
                    (validationError as any).errors = formattedErrors;
                    throw validationError;
                }

                throw new Error(errorData.message || 'Registration failed');
            }

            // Fetch user data after successful registration
            await fetchUser();
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setLoggingOut(true);

        try {
            // Get CSRF token first
            await getCsrfToken();

            await fetch('/logout', {
                // Web route, not /api/logout
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCsrfTokenFromCookie() || '',
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        setUser(null);
        setLoggingOut(false);
    };

    const updateProfile = async (data: { name: string; email: string }) => {
        const response = await apiCall('/api/profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        setUser(response.user);
    };

    // Fix initial user fetching logic - only fetch on protected routes
    useEffect(() => {
        // Check if we're on a protected route that requires authentication
        const isPublicRoute = ['/login', '/register', '/forgot-password', '/reset-password', '/'].includes(window.location.pathname);

        if (isPublicRoute) {
            // On public routes, don't fetch user data to avoid 401 errors
            setLoading(false);
        } else {
            // On protected routes, fetch user data to check authentication
            fetchUser(true);
        }
    }, []);

    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
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
