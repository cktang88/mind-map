"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const generateQuizTitle = async (file: string) => {
  if (!process.env.GOOGLE_GENERATIVE_AI_MODEL) {
    throw new Error("GOOGLE_GENERATIVE_AI_MODEL is not defined.");
  }
  const result = await generateObject({
    model: google(process.env.GOOGLE_GENERATIVE_AI_MODEL),
    schema: z.object({
      title: z
        .string()
        .describe(
          "A max three word title for the quiz based on the file provided as context"
        ),
    }),
    prompt:
      "Generate a title for a quiz based on the following (PDF) file name. Try and extract as much info from the file name as possible. If the file name is just numbers or incoherent, just return quiz.\n\n " +
      file,
  });
  return result.object.title;
};
