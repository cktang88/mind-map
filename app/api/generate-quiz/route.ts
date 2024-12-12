import { pdfExtractSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;
  if (!process.env.GOOGLE_GENERATIVE_AI_MODEL) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_MODEL environment variable");
  }

  const result = await streamObject({
    model: google(process.env.GOOGLE_GENERATIVE_AI_MODEL),
    messages: [
      {
        role: "system",
        content:
          "You are a document analyzer. Extract the most important points from the provided PDF document. Focus on key information, main ideas, and significant details, such as any anecdotes or statistics or past cited studies by other authors. If it's a book, do one high level point per chapter.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please read this PDF and extract the key points. For each key point, include subarguments or subpoints that are relevant to the key point. These may be statistics, anecdotes, or other details that flesh out the key point. Be VERY specific, for example, don't say `discusses the importance of X`, say what it discussed about X and what it said specifically about X.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: pdfExtractSchema,
    output: "object",
    onFinish: ({ object }) => {
      const res = pdfExtractSchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}
