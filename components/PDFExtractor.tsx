"use client";

import { useState } from "react";
import { experimental_useObject } from "ai/react";
import { toast } from "sonner";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { pdfExtractSchema, type PDFExtract } from "@/lib/schemas";
import React from "react";

interface PDFExtractorProps {
  onExtractComplete?: (content: PDFExtract) => void;
  onPartialContent?: (content: Partial<PDFExtract>) => void;
}

interface ContextTagProps {
  context: string;
}

function ContextTag({ context }: ContextTagProps) {
  return (
    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md text-sm">
      {context}
    </span>
  );
}

interface ContextHeaderProps {
  context: string[] | string | undefined;
}

function ContextHeader({ context }: ContextHeaderProps) {
  if (!context) {
    return <h4 className="font-medium text-md text-zinc-500">General</h4>;
  }

  if (!Array.isArray(context)) {
    return <h4 className="font-medium text-md text-zinc-500">{context}</h4>;
  }

  return (
    <h4 className="font-medium text-md text-zinc-500">
      <div className="flex items-center gap-2 flex-wrap">
        {context.map((ctx, i) => (
          <ContextTag key={i} context={ctx} />
        ))}
      </div>
    </h4>
  );
}

interface KeyPointProps {
  point: string;
}

function KeyPoint({ point }: KeyPointProps) {
  return (
    <li className="space-y-1 mt-3">
      <p className="text-lg text-muted-foreground">{point}</p>
    </li>
  );
}

interface KeyPointsListProps {
  keyPoints: PDFExtract["keyPoints"];
}

function KeyPointsList({ keyPoints }: KeyPointsListProps) {
  const hasContextChanged = (index: number) => {
    if (index === 0) return true;
    return (
      JSON.stringify(keyPoints[index].context) !==
      JSON.stringify(keyPoints[index - 1]?.context)
    );
  };

  return (
    <ul className="space-y-3 text-xl">
      {keyPoints.map((item, index) => (
        <React.Fragment key={index}>
          {hasContextChanged(index) && (
            <div className="mt-6 first:mt-2">
              <ContextHeader context={item.context} />
            </div>
          )}
          <KeyPoint point={item.point} />
        </React.Fragment>
      ))}
    </ul>
  );
}

interface ExtractedContentProps {
  content: PDFExtract;
}

function ExtractedContent({ content }: ExtractedContentProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden mt-8 min-h-0">
      <h2 className="text-sm text-zinc-400 font-mono flex-shrink-0">
        KEY POINTS
      </h2>
      <div
        className="flex-1 overflow-y-auto mt-4 pr-2 min-h-0
              scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent
              hover:scrollbar-thumb-gray-400"
      >
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{content.title}</h3>
          <KeyPointsList keyPoints={content.keyPoints} />
        </div>
      </div>
    </div>
  );
}

export default function PDFExtractor({
  onExtractComplete,
  onPartialContent,
}: PDFExtractorProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const {
    submit,
    object: extractedContent,
    isLoading,
  } = experimental_useObject<PDFExtract>({
    api: "/api/generate-quiz",
    schema: pdfExtractSchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to analyze PDF. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      if (object) {
        onExtractComplete?.(object);
        onPartialContent?.(object);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker."
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      }))
    );
    submit({ files: encodedFiles });
  };

  return (
    <Card className="w-full h-full border-none shadow-none flex flex-col">
      <CardHeader className="text-center space-y-6 flex-shrink-0">
        <div className="space-y-2 mt-4">
          <CardTitle className="text-2xl mb-4 tracking-normal font-bold">
            Mind Map Maker
          </CardTitle>
          <CardDescription className="text-base">
            Upload a PDF to generate a mind map using{" "}
            <Link href="https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai">
              Google&apos;s Gemini 2.0 Flash (experimental)
            </Link>
            .
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <form
          onSubmit={handleSubmitWithFiles}
          className="space-y-4 flex-shrink-0"
        >
          <div
            className="relative flex flex-col items-center justify-center 
            border border-dashed border-muted-foreground/25 
            bg-[#FCFCFC] hover:bg-[#F5F5F5] transition duration-500 hover:duration-200
            rounded-lg px-8 py-6 transition-colors"
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileUp className="h-8 w-8 mb-4 text-zinc-400" />
            <p className="text-sm text-zinc-500 text-center px-8">
              {files.length > 0 ? (
                <span className="font-medium">{files[0].name}</span>
              ) : (
                <span>Drop your PDF here (max 5 MB) or click to browse.</span>
              )}
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 font-mono 
            shadow-md shadow-orange-800/20
            hover:bg-orange-600 hover:shadow-orange-800/30
            active:shadow-none transition-all duration-400"
            disabled={files.length === 0}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing PDF...</span>
              </span>
            ) : (
              "Extract key points"
            )}
          </Button>
        </form>

        {extractedContent && extractedContent.keyPoints && (
          <ExtractedContent content={extractedContent} />
        )}
      </CardContent>

      <CardFooter className="flex-shrink-0">
        {isLoading && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Analyzing document...</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
