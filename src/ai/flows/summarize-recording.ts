"use server";

/**
 * @fileOverview Summarizes a video recording from a security camera.
 *
 * - summarizeRecording - A function that generates a title and summary for a video clip.
 * - SummarizeRecordingInput - The input type for the summarizeRecording function.
 * - SummarizeRecordingOutput - The return type for the summarizeRecording function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeRecordingInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A short video clip, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  cameraName: z
    .string()
    .describe('The name of the camera where the recording was taken.'),
});
export type SummarizeRecordingInput = z.infer<
  typeof SummarizeRecordingInputSchema
>;

const SummarizeRecordingOutputSchema = z.object({
  title: z
    .string()
    .describe('A concise, descriptive title for the video clip.'),
  summary: z
    .string()
    .describe(
      'A brief summary of the events that occurred in the video clip.'
    ),
});
export type SummarizeRecordingOutput = z.infer<
  typeof SummarizeRecordingOutputSchema
>;

export async function summarizeRecording(
  input: SummarizeRecordingInput
): Promise<SummarizeRecordingOutput> {
  return summarizeRecordingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRecordingPrompt',
  input: { schema: SummarizeRecordingInputSchema },
  output: { schema: SummarizeRecordingOutputSchema },
  prompt: `You are a security analyst. Your task is to review a short video clip from a security camera and provide a title and summary.

The video was recorded from the camera named: '{{cameraName}}'.

Analyze the video frames and describe the key events. Note any people, vehicles, or unusual activity.
Be concise and factual in your summary. Create a short, descriptive title for the clip.

Video clip: {{media url=videoDataUri}}`,
});

const summarizeRecordingFlow = ai.defineFlow(
  {
    name: 'summarizeRecordingFlow',
    inputSchema: SummarizeRecordingInputSchema,
    outputSchema: SummarizeRecordingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
