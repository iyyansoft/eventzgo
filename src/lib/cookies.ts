// Cookie utility functions for client-side cookie management

export interface CookieOptions {
    maxAge?: number; // in seconds
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
    const {
        maxAge,
        expires,
        path = '/',
        domain,
        secure = process.env.NODE_ENV === 'production',
        sameSite = 'lax',
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (maxAge !== undefined) {
        cookieString += `; Max-Age=${maxAge}`;
    }

    if (expires) {
        cookieString += `; Expires=${expires.toUTCString()}`;
    }

    cookieString += `; Path=${path}`;

    if (domain) {
        cookieString += `; Domain=${domain}`;
    }

    if (secure) {
        cookieString += '; Secure';
    }

    cookieString += `; SameSite=${sameSite}`;

    document.cookie = cookieString;
}

/**
 * Get a cookie value
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');

    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (decodeURIComponent(cookieName) === name) {
            return decodeURIComponent(cookieValue);
        }
    }

    return null;
}

/**
 * Delete a cookie
 * @param name - Cookie name
 * @param options - Cookie options (path and domain should match the original cookie)
 */
export function deleteCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
    setCookie(name, '', {
        ...options,
        maxAge: -1,
    });
}

/**
 * Get all cookies as an object
 * @returns Object with cookie names as keys and values
 */
export function getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};

    const cookieStrings = document.cookie.split('; ');

    for (const cookie of cookieStrings) {
        const [name, value] = cookie.split('=');
        if (name && value) {
            cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
    }

    return cookies;
}

/**
 * Check if a cookie exists
 * @param name - Cookie name
 * @returns True if cookie exists
 */
export function hasCookie(name: string): boolean {
    return getCookie(name) !== null;
}

/**
 * Parse a cookie value as JSON
 * @param name - Cookie name
 * @returns Parsed JSON object or null
 */
export function getCookieJSON<T = any>(name: string): T | null {
    const value = getCookie(name);
    if (!value) return null;

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

/**
 * Set a cookie with JSON value
 * @param name - Cookie name
 * @param value - Object to store
 * @param options - Cookie options
 */
export function setCookieJSON(name: string, value: any, options: CookieOptions = {}): void {
    setCookie(name, JSON.stringify(value), options);
}
