import { mockCameras, mockLayouts } from "./mock-data";
import type { Camera, Layout } from "./types";

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
    if (typeof window === 'undefined') return mockCameras;
    const stored = localStorage.getItem('cameras');
    if (stored) {
        return safelyParseJSON<Camera[]>(stored, mockCameras);
    }
    // If nothing is in storage, set it with mock data
    localStorage.setItem('cameras', JSON.stringify(mockCameras));
    return mockCameras;
}

export function getLayouts(): Layout[] {
    if (typeof window === 'undefined') return mockLayouts;
    const stored = localStorage.getItem('layouts');
    if (stored) {
        return safelyParseJSON<Layout[]>(stored, mockLayouts);
    }
    localStorage.setItem('layouts', JSON.stringify(mockLayouts));
    return mockLayouts;
}
