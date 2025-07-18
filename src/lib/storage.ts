
import type { Camera, Layout, Recording } from "./types";

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

    