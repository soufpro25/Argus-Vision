'use server';

/**
 * @fileOverview Generates a situation report based on multiple camera feeds.
 *
 * - generateSituationReport - A function that creates a summary from multiple camera frames.
 * - SituationReportInput - The input type for the generateSituationReport function.
 * - SituationReportOutput - The return type for the generateSituationReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SituationReportInputSchema = z.object({
  cameraFeeds: z.array(
    z.object({
      cameraName: z.string().describe('The name of the camera.'),
      videoDataUri: z
        .string()
        .describe(
          "A video frame, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    })
  ),
});
export type SituationReportInput = z.infer<typeof SituationReportInputSchema>;

const SituationReportOutputSchema = z.object({
  report: z.string().describe('A comprehensive summary of the situation across all camera feeds.'),
});
export type SituationReportOutput = z.infer<typeof SituationReportOutputSchema>;

export async function generateSituationReport(input: SituationReportInput): Promise<SituationReportOutput> {
  return generateSituationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSituationReportPrompt',
  input: {schema: SituationReportInputSchema},
  output: {schema: SituationReportOutputSchema},
  prompt: `You are a security chief monitoring a bank of security cameras.
Your task is to provide a brief, high-level summary of the current situation based on the frames provided from multiple cameras.

Synthesize the information from all feeds into a single, cohesive report. Mention any notable activity, presence of people, or anything unusual. If there is no activity, state that all is quiet.

Camera Feeds:
{{#each cameraFeeds}}
- Camera: {{this.cameraName}}
  Frame: {{media url=this.videoDataUri}}
{{/each}}
`,
});

const generateSituationReportFlow = ai.defineFlow(
  {
    name: 'generateSituationReportFlow',
    inputSchema: SituationReportInputSchema,
    outputSchema: SituationReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
