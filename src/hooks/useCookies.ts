'use client';

import { useState, useCallback, useEffect } from 'react';
import { setCookie, getCookie, deleteCookie, CookieOptions } from '@/lib/cookies';

/**
 * React hook for managing cookies
 * @param key - Cookie name
 * @param defaultValue - Default value if cookie doesn't exist
 * @returns [value, setValue, deleteCookie]
 */
export function useCookie(
    key: string,
    defaultValue: string = ''
): [string, (value: string, options?: CookieOptions) => void, () => void] {
    const [value, setValue] = useState<string>(() => {
        if (typeof window === 'undefined') return defaultValue;
        return getCookie(key) ?? defaultValue;
    });

    const updateCookie = useCallback(
        (newValue: string, options?: CookieOptions) => {
            setCookie(key, newValue, options);
            setValue(newValue);
        },
        [key]
    );

    const removeCookie = useCallback(() => {
        deleteCookie(key);
        setValue(defaultValue);
    }, [key, defaultValue]);

    // Sync with cookie changes from other tabs
    useEffect(() => {
        const handleStorageChange = () => {
            const newValue = getCookie(key);
            if (newValue !== null && newValue !== value) {
                setValue(newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, value]);

    return [value, updateCookie, removeCookie];
}

/**
 * React hook for managing JSON cookies
 * @param key - Cookie name
 * @param defaultValue - Default value if cookie doesn't exist
 * @returns [value, setValue, deleteCookie]
 */
export function useCookieJSON<T>(
    key: string,
    defaultValue: T
): [T, (value: T, options?: CookieOptions) => void, () => void] {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') return defaultValue;
        const cookieValue = getCookie(key);
        if (!cookieValue) return defaultValue;
        try {
            return JSON.parse(cookieValue) as T;
        } catch {
            return defaultValue;
        }
    });

    const updateCookie = useCallback(
        (newValue: T, options?: CookieOptions) => {
            setCookie(key, JSON.stringify(newValue), options);
            setValue(newValue);
        },
        [key]
    );

    const removeCookie = useCallback(() => {
        deleteCookie(key);
        setValue(defaultValue);
    }, [key, defaultValue]);

    return [value, updateCookie, removeCookie];
}

/**
 * Hook for managing multiple cookies
 */
export function useCookies() {
    const get = useCallback((key: string) => getCookie(key), []);

    const set = useCallback((key: string, value: string, options?: CookieOptions) => {
        setCookie(key, value, options);
    }, []);

    const remove = useCallback((key: string) => {
        deleteCookie(key);
    }, []);

    return { getCookie: get, setCookie: set, deleteCookie: remove };
}
