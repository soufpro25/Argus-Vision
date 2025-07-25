
import { NextResponse } from 'next/server';
import { getCameras } from '@/lib/storage.server';

// In a real application, you'd fetch this from a database.
// For this demo, we'll read from the same underlying 'storage' mechanism,
// but we need a server-side version of the function.

/**
 * @swagger
 * /api/cameras:
 *   get:
 *     summary: Retrieve a list of cameras
 *     description: Returns a list of all configured cameras. This endpoint is intended to be used by server-side scripts for automation.
 *     responses:
 *       200:
 *         description: A JSON array of camera objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   streamUrl:
 *                     type: string
 */
export async function GET() {
  // This is a placeholder for server-side fetching.
  // In a real scenario with a proper backend, you would have a separate
  // server-side function to read from your database.
  // For this project's architecture, we are creating a simulated server-side
  // function that would conceptually be different from the client-side getCameras.
  const cameras = getCameras(); 
  
  return NextResponse.json(cameras, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// This utility would live in a server-only file in a real app.
// We include it here to simulate fetching data on the server.
// NOTE: This approach is for demonstration purposes. A production app would
// use a database and have proper server-side data fetching logic.
const storage = {
  getItem(key: string) {
    // This is a conceptual placeholder. On a real server, you wouldn't
    // have localStorage. You'd read from a file or a database.
    // We assume the data is in a `db.json` file for this example.
    const fs = require('fs');
    const path = require('path');
    
    // This is NOT a secure or robust way to manage data. For demo only.
    try {
        const dbPath = path.resolve(process.cwd(), 'db.json');
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            const json = JSON.parse(data);
            return json[key];
        }
    } catch (e) {
        console.error("Could not read server-side db.json", e);
    }
    return null;
  }
};

function getCameras() {
    const stored = storage.getItem('cameras');
    if (stored) {
        return stored;
    }
    return [];
}
