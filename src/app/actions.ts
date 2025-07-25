'use server';

import { describeLayout } from '@/ai/flows/describe-layout';
import { summarizeRecording, type SummarizeRecordingInput } from '@/ai/flows/summarize-recording';
import { smartObjectDetection, type SmartObjectDetectionInput } from '@/ai/flows/smart-object-detection';
import { generateSituationReport, type SituationReportInput } from '@/ai/flows/situation-report';
import type { Camera } from '@/lib/types';
import { saveCameras as saveCamerasToServer } from '@/lib/storage.server';


export async function suggestLayoutAction(cameras: { cameraId: string, locationDescription: string, server?: string }[]) {
  try {
    const result = await describeLayout({ cameraDescriptions: cameras });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error suggesting layout:', error);
    return { success: false, error: 'Failed to suggest a layout.' };
  }
}

export async function summarizeRecordingAction(input: SummarizeRecordingInput) {
    try {
        const result = await summarizeRecording(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error summarizing recording:', error);
        return { success: false, error: 'Failed to summarize the recording.' };
    }
}

export async function detectObjectsAction(input: SmartObjectDetectionInput) {
    try {
        const result = await smartObjectDetection(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error detecting objects:', error);
        return { success: false, error: 'Failed to detect objects.' };
    }
}

export async function generateReportAction(input: SituationReportInput) {
    try {
        const result = await generateSituationReport(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating report:', error);
        return { success: false, error: 'Failed to generate report.' };
    }
}

// This is a new server action to keep the server "DB" in sync
export async function syncCamerasWithServer(cameras: Camera[]) {
    // In a real app, this would be a proper API call to a secure backend.
    // For this demo, we're using a server-side function.
    try {
        saveCamerasToServer(cameras);
    } catch (e) {
        console.error("Failed to sync cameras with server", e);
        // This failure is silent to the user in this context, but in a real app you'd handle it.
    }
}