'use server';

import { describeLayout } from '@/ai/flows/describe-layout';
import { smartObjectDetection, type SmartObjectDetectionInput } from '@/ai/flows/smart-object-detection';
import { summarizeRecording, type SummarizeRecordingInput } from '@/ai/flows/summarize-recording';
import type { Camera } from '@/lib/types';

export async function suggestLayoutAction(cameras: Pick<Camera, 'id' | 'description'>[]) {
  try {
    const cameraDescriptions = cameras.map(cam => ({
      cameraId: cam.id,
      locationDescription: cam.description,
    }));
    const result = await describeLayout({ cameraDescriptions });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error suggesting layout:', error);
    return { success: false, error: 'Failed to suggest a layout.' };
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

export async function summarizeRecordingAction(input: SummarizeRecordingInput) {
    try {
        const result = await summarizeRecording(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error summarizing recording:', error);
        return { success: false, error: 'Failed to summarize the recording.' };
    }
}
