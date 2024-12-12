import { z } from "zod";

export const pdfExtractSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(500, "Title is too long")
    .describe("The document title"),

  keyPoints: z
    .array(
      z.object({
        point: z
          .string()
          .min(1, "Point cannot be empty")
          .max(1000, "Point is too long")
          .describe(
            "A key argument or point from the document, be very specific and detailed"
          ),

        context: z
          .array(
            z
              .string()
              .min(1, "Context cannot be empty")
              .max(500, "Context is too long")
              .describe(
                "A detailed subargument, could be more nuance, details, statistics, anecdotes, etc."
              )
          )
          .describe(
            "Subarguments, including detailedcontext, details, statistics, anecdotes, etc."
          )
          .min(3, "At least 3 subpoints are required")
          .max(10, "Too many subpoints"),
      })
    )
    .min(1, "At least one key point is required")
    .max(20, "Too many key points")
    .describe("List of important points extracted from the document"),
});

export type PDFExtract = z.infer<typeof pdfExtractSchema>;
