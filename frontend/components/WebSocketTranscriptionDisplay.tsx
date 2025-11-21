"use client";

import { useEffect, useRef } from "react";
import { TranscriptionResult } from "../types";

interface WebSocketTranscriptionDisplayProps {
  transcriptions: TranscriptionResult[];
}

export default function WebSocketTranscriptionDisplay({
  transcriptions,
}: WebSocketTranscriptionDisplayProps) {
  const textAreaRef = useRef<HTMLDivElement>(null);

  const successfulTranscriptions = transcriptions
    .filter(
      (t) =>
        t.type === "transcription" &&
        t.status === "success" &&
        t.transcription?.trim()
    )
    .map((t) => t.transcription!.trim())
    .join("");

  const summaries = transcriptions.filter((t) => t.type === "summary");
  const errors = transcriptions.filter((t) => t.status !== "success");

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Real-time Transcriptions</h2>

      {/* TRANSCRIPTION AREA */}
      <div
        ref={textAreaRef}
        className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto mb-4"
      >
        {successfulTranscriptions || "No transcriptions yet..."}
      </div>

      {/* SUMMARY AREA */}
      {summaries.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Summary</h3>
          {summaries.map((summary, index) => (
            <div key={index} className="text-blue-700">
              {summary.summary}
            </div>
          ))}
        </div>
      )}

      {/* ERROR AREA */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="text-sm text-red-600 bg-red-50 p-2 rounded"
            >
              Error: {error.error || "Unknown error"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
