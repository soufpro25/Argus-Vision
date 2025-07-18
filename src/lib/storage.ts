
import type { Camera, Layout, Recording, User } from "./types";

function safelyParseJSON<T>(jsonString: string | null, fallback: T): T {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.error("Failed to parse JSON from localStorage", e);
        return fallback;
    }
}

export function getCameras(): Camera[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('cameras');
    return safelyParseJSON<Camera[]>(stored, []);
}

export function getLayouts(): Layout[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('layouts');
    return safelyParseJSON<Layout[]>(stored, []);
}

export function getRecordings(): Recording[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('recordings');
    return safelyParseJSON<Recording[]>(stored, []);
}

export function getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('users');
    return safelyParseJSON<User[]>(stored, []);
}

export function getActiveUser(): User | null {
     if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('activeUser');
    return safelyParseJSON<User | null>(stored, null);
}
