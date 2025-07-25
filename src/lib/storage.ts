
import type { Camera, Layout, Recording, StorageConfig, User } from "./types";
import { subDays } from 'date-fns';

function safelyParseJSON<T>(jsonString: string | null, fallback: T): T {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.error("Failed to parse JSON from localStorage", e);
        return fallback;
    }
}

// Recordings
export function getRecordings(): Recording[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('recordings');
    return safelyParseJSON<Recording[]>(stored, []);
}

export function saveRecordings(recordings: Recording[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('recordings', JSON.stringify(recordings));
}

// Cameras
export function getCameras(): Camera[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('cameras');
    return safelyParseJSON<Camera[]>(stored, []);
}

export function saveCameras(cameras: Camera[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cameras', JSON.stringify(cameras));
}

// Layouts
export function getLayouts(): Layout[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('layouts');
    return safelyParseJSON<Layout[]>(stored, []);
}

// Users
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


// Storage Config
const defaultStorageConfig: StorageConfig = {
    retentionDays: 0, // 0 means keep forever
};

export function getStorageConfig(): StorageConfig {
    if (typeof window === 'undefined') return defaultStorageConfig;
    const stored = localStorage.getItem('storageConfig');
    return safelyParseJSON<StorageConfig>(stored, defaultStorageConfig);
}

export function saveStorageConfig(config: StorageConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('storageConfig', JSON.stringify(config));
}

export function applyRetentionPolicy(): void {
    if (typeof window === 'undefined') return;
    
    const config = getStorageConfig();
    if (config.retentionDays === 0) {
        console.log('Retention policy is set to "Keep Forever". Skipping cleanup.');
        return;
    }

    const recordings = getRecordings();
    const retentionDate = subDays(new Date(), config.retentionDays);
    
    const keptRecordings = recordings.filter(rec => new Date(rec.timestamp) >= retentionDate);

    if (keptRecordings.length < recordings.length) {
        console.log(`Applying retention policy: Deleting ${recordings.length - keptRecordings.length} recordings older than ${config.retentionDays} days.`);
        saveRecordings(keptRecordings);
    }
}

export function getStorageUsage(): { bytes: number, formatted: string } {
    if (typeof window === 'undefined') return { bytes: 0, formatted: '0 KB' };

    const recordings = localStorage.getItem('recordings') || '';
    const users = localStorage.getItem('users') || '';
    const layouts = localStorage.getItem('layouts') || '';
    const cameras = localStorage.getItem('cameras') || '';
    const config = localStorage.getItem('storageConfig') || '';
    const activeUser = localStorage.getItem('activeUser') || '';

    const totalBytes = new Blob([recordings, users, layouts, cameras, config, activeUser]).size;

    if (totalBytes < 1024) {
        return { bytes: totalBytes, formatted: `${totalBytes} B` };
    } else if (totalBytes < 1024 * 1024) {
        return { bytes: totalBytes, formatted: `${(totalBytes / 1024).toFixed(2)} KB` };
    } else {
        return { bytes: totalBytes, formatted: `${(totalBytes / 1024 / 1024).toFixed(2)} MB` };
    }
}
