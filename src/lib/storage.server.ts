
// This file is intended for server-side data access.
// In a real-world application, this would connect to a database,
// read from a secure file, or call another service.

// For the purpose of this self-contained demo, we'll simulate this
// by reading from a JSON file on disk, which acts as our "database".
// The client-side `localStorage` and this server-side file will be
// kept in sync manually for the demo.

import type { Camera } from './types';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'db.json');

function readDb(): { cameras: Camera[] } {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf-8');
            // Handle empty file case
            if (data) {
                return JSON.parse(data);
            }
        }
    } catch (e) {
        console.error("Error reading database file:", e);
    }
    // Return a default structure if file doesn't exist, is empty, or fails to parse
    return { cameras: [] }; 
}

function writeDb(data: any) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch(e) {
        console.error("Error writing to database file:", e);
    }
}


export function getCameras(): Camera[] {
    const db = readDb();
    return db.cameras || [];
}

// This function is crucial for keeping the server-side "DB"
// in sync with what the user saves in the client-side `localStorage`.
export function saveCameras(cameras: Camera[]): void {
   const db = readDb();
   db.cameras = cameras;
   writeDb(db);
}
