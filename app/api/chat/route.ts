import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable");
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!process.env.GOOGLE_GENERATIVE_AI_MODEL) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_MODEL environment variable");
  }

  const result = await streamText({
    model: google(process.env.GOOGLE_GENERATIVE_AI_MODEL),
    system: "You are a teacher...",
    messages,
  });

  return result.toDataStreamResponse();
}
