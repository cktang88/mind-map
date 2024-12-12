"use client";

import { useState } from "react";
import { NodeData } from "@/app/types/types";
import MindMap from "@/components/MindMap";
import PDFExtractor from "@/components/PDFExtractor";
import type { PDFExtract } from "@/lib/schemas";

export default function PDFAnalyzer() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [mindMapData, setMindMapData] = useState<NodeData>({
    id: "root",
    label: "",
    children: [],
  });

  const handleExtractComplete = (extractedContent: PDFExtract) => {
    const rootNode: NodeData = {
      id: "root",
      label: extractedContent.title || "Untitled Document",
      children: [],
    };

    if (!extractedContent.keyPoints) return rootNode;

    // Add points as direct children of root
    extractedContent.keyPoints.forEach((item, index) => {
      if (!item) return;

      const pointNode: NodeData = {
        id: `point-${index}`,
        label: item.point || "No content",
        children: [],
      };

      // Add contexts as children of the point
      if (Array.isArray(item.context)) {
        item.context.forEach((context, ctxIndex) => {
          pointNode.children?.push({
            id: `context-${index}-${ctxIndex}`,
            label: context,
          });
        });
      }

      rootNode.children?.push(pointNode);
    });

    setMindMapData(rootNode);
  };

  const handlePartialContent = (content: Partial<PDFExtract>) => {
    if (content.title || content.keyPoints?.length) {
      const rootNode: NodeData = {
        id: "root",
        label: content.title || "Loading...",
        children: [],
      };

      content.keyPoints?.forEach((item, index) => {
        if (!item) return;

        const pointNode: NodeData = {
          id: `point-${index}`,
          label: item.point || "Loading...",
          children: [],
        };

        // Add contexts as children of the point
        if (Array.isArray(item.context)) {
          item.context.forEach((context, ctxIndex) => {
            pointNode.children?.push({
              id: `context-${index}-${ctxIndex}`,
              label: context,
            });
          });
        }

        rootNode.children?.push(pointNode);
      });

      setMindMapData(rootNode);
    }
  };

  return (
    <div className="max-h-[100dvh] w-full flex gap-4 p-4 bg-zinc-100">
      <div
        className={`${
          mindMapData.children?.length ? "w-[400px]" : "w-[50%]"
        } transition-all duration-300`}
      >
        <PDFExtractor
          onExtractComplete={handleExtractComplete}
          onPartialContent={handlePartialContent}
        />
      </div>

      <div className="flex-grow h-[calc(100vh-2rem)] border border-zinc-200 bg-white overflow-hidden rounded-xl shadow-sm">
        <MindMap
          data={mindMapData}
          onNodeClick={(node) => setSelectedNode(node)}
        />
      </div>
    </div>
  );
}
