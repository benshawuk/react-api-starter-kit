/**
 * Get CSRF token by making a request to /sanctum/csrf-cookie
 */
export const getCsrfToken = async (): Promise<void> => {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
    });
};

/**
 * Extract CSRF token from browser cookies
 */
export const getCsrfTokenFromCookie = (): string | null => {
    const name = 'XSRF-TOKEN';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
};

/**
 * Make an authenticated API call with session-based authentication
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const csrfToken = getCsrfTokenFromCookie();
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
        ...options.headers,
    };

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Critical for session cookies
    });
};