//Describe Layout Flow
'use server';

/**
 * @fileOverview Describes the layout of cameras based on natural language input.
 *
 * - describeLayout - A function that generates a suggested camera layout based on the provided descriptions.
 * - DescribeLayoutInput - The input type for the describeLayout function.
 * - DescribeLayoutOutput - The return type for the describeLayout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescribeLayoutInputSchema = z.object({
  cameraDescriptions: z.array(
    z.object({
      cameraId: z.string().describe('The unique identifier for the camera.'),
      locationDescription: z
        .string()
        .describe(
          'A natural language description of the camera location, including key areas visible in the camera feed.'
        ),
    })
  ).describe('An array of camera descriptions, each including an ID and a location description.'),
});
export type DescribeLayoutInput = z.infer<typeof DescribeLayoutInputSchema>;

const DescribeLayoutOutputSchema = z.object({
  suggestedLayout: z
    .array(z.string())
    .describe(
      'An ordered list of camera IDs representing the suggested layout based on the location descriptions.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested layout, explaining how the camera locations relate to each other.'
    ),
});
export type DescribeLayoutOutput = z.infer<typeof DescribeLayoutOutputSchema>;

export async function describeLayout(input: DescribeLayoutInput): Promise<DescribeLayoutOutput> {
  return describeLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'describeLayoutPrompt',
  input: {schema: DescribeLayoutInputSchema},
  output: {schema: DescribeLayoutOutputSchema},
  prompt: `You are an AI assistant that suggests camera layouts based on their location descriptions. The goal is to provide a logical and intuitive arrangement of camera feeds for the user.

Given the following camera descriptions:

{{#each cameraDescriptions}}
- Camera ID: {{this.cameraId}}
  Location Description: {{this.locationDescription}}
{{/each}}

Suggest a layout (an ordered list of camera IDs) and explain your reasoning. Consider the relationships between camera locations (e.g., adjacency, overlap in coverage, logical flow of movement).

Output the layout as an array of camera IDs and provide a clear explanation of your reasoning.

Example Output:
{
  "suggestedLayout": ["camera1", "camera3", "camera2"],
  "reasoning": "Camera 1 covers the entrance, Camera 3 covers the hallway connected to the entrance, and Camera 2 covers the living room adjacent to the hallway."
}
`,
});

const describeLayoutFlow = ai.defineFlow(
  {
    name: 'describeLayoutFlow',
    inputSchema: DescribeLayoutInputSchema,
    outputSchema: DescribeLayoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
