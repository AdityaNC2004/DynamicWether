
'use server';
/**
 * @fileOverview A weather forecast summarization AI agent.
 *
 * - summarizeForecast - A function that handles the forecast summarization.
 * - ForecastInput - The input type for the summarizeForecast function.
 * - ForecastOutput - The return type for the summarizeForecast function.
 */

import { ai } from '@/ai/genkit';
import type { Forecast } from '@/hooks/use-forecast';
import { z } from 'zod';

const ForecastInputSchema = z.object({
  current: z.object({
    location: z.string(),
    temperature: z.number(),
    condition: z.string(),
    wind: z.number(),
    humidity: z.number(),
  }),
  hourly: z.array(z.object({
    time: z.string(),
    temp: z.number(),
    condition: z.string(),
    isDay: z.boolean(),
  })),
  daily: z.array(z.object({
    day: z.string(),
    condition: z.string(),
    high: z.number(),
    low: z.number(),
    sunrise: z.string(),
    sunset: z.string(),
  })),
});
export type ForecastInput = z.infer<typeof ForecastInputSchema>;

const ForecastOutputSchema = z.object({
  summary: z.string().describe('A short, conversational summary of the weather forecast.'),
});
export type ForecastOutput = z.infer<typeof ForecastOutputSchema>;


export async function summarizeForecast(input: Forecast): Promise<ForecastOutput> {
  return forecastSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastSummaryPrompt',
  input: { schema: ForecastInputSchema },
  output: { schema: ForecastOutputSchema },
  prompt: `
    You are a friendly and helpful weather assistant. 
    Analyze the provided weather data and generate a short, easy-to-read, conversational summary.
    Mention the current conditions and highlight any significant changes over the next few days (like rain or a big temperature jump).
    Keep it concise and friendly, around 2-3 sentences.

    Current Location: {{{current.location}}}

    Current Weather:
    - Temperature: {{{current.temperature}}}°
    - Condition: {{{current.condition}}}

    Hourly Forecast:
    {{#each hourly}}
    - {{time}}: {{temp}}°, {{condition}}
    {{/each}}

    Daily Forecast:
    {{#each daily}}
    - {{day}}: {{high}}°/{{low}}°, {{condition}}
    {{/each}}
  `,
});

const forecastSummaryFlow = ai.defineFlow(
  {
    name: 'forecastSummaryFlow',
    inputSchema: ForecastInputSchema,
    outputSchema: ForecastOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
