
import { NextResponse } from 'next/server';
import { getCameras } from '@/lib/storage.server';

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
  const cameras = getCameras(); 
  
  return NextResponse.json(cameras, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
