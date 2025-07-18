'use server';

/**
 * @fileOverview A smart object detection AI agent that filters object detection results based on user criteria.
 *
 * - smartObjectDetection - A function that handles the object detection filtering process.
 * - SmartObjectDetectionInput - The input type for the smartObjectDetection function.
 * - SmartObjectDetectionOutput - The return type for the smartObjectDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartObjectDetectionInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video frame, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  detectionCriteria: z
    .string()
    .describe(
      'The criteria for filtering object detections, such as specific object types (e.g., person, car) or confidence thresholds.'
    ),
  existingObjects: z
    .string()
    .optional()
    .describe(
      'JSON array of objects already detected, each object represented with bounding box coordinates (x1, y1, x2, y2) and object labels.'
    ),
});
export type SmartObjectDetectionInput = z.infer<typeof SmartObjectDetectionInputSchema>;

const SmartObjectDetectionOutputSchema = z.object({
  filteredObjects: z.array(
    z.object({
      label: z.string().describe('The label of the detected object.'),
      confidence: z.number().describe('The confidence score of the detection.'),
      box: z.array(z.number()).length(4).describe('The bounding box coordinates [x1, y1, x2, y2].'),
    })
  ).describe('The filtered list of detected objects based on the specified criteria.'),
  summary: z.string().describe('A summary of detected objects, providing context for objects detected.'),
});
export type SmartObjectDetectionOutput = z.infer<typeof SmartObjectDetectionOutputSchema>;

export async function smartObjectDetection(input: SmartObjectDetectionInput): Promise<SmartObjectDetectionOutput> {
  return smartObjectDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartObjectDetectionPrompt',
  input: {schema: SmartObjectDetectionInputSchema},
  output: {schema: SmartObjectDetectionOutputSchema},
  prompt: `You are an expert in computer vision and object detection.

You are given a video frame and a set of detection criteria.
Your task is to filter the object detections based on the criteria and return only the relevant objects.

Video Frame: {{media url=videoDataUri}}

Existing Objects: {{{existingObjects}}}

Detection Criteria: {{{detectionCriteria}}}


Based on the Detection Criteria, filter the object detections and extract details about them, and then generate a summary for objects detected.

Return the filtered objects in JSON format.
`,
});

const smartObjectDetectionFlow = ai.defineFlow(
  {
    name: 'smartObjectDetectionFlow',
    inputSchema: SmartObjectDetectionInputSchema,
    outputSchema: SmartObjectDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
