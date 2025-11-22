"use client";

import { useState, useRef } from "react";
import { Mic } from "lucide-react";

interface WebSocketAudioRecorderProps {
  onNewTranscription: (result: any) => void;
}

export default function WebSocketAudioRecorder({
  onNewTranscription,
}: WebSocketAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      const result = JSON.parse(event.data);
      console.log("Received transcription:", result);
      onNewTranscription(result);
    };
    websocketRef.current = ws;
  };

  const startRecording = async () => {
    try {
      if (
        !websocketRef.current ||
        websocketRef.current.readyState !== WebSocket.OPEN
      ) {
        connectWebSocket();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 44100, channelCount: 1 },
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      let chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (
          chunks.length > 0 &&
          websocketRef.current?.readyState === WebSocket.OPEN
        ) {
          const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" });
          websocketRef.current.send(blob);
          chunks = [];
        }
      };

      mediaRecorder.start();

      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setTimeout(() => {
            if (mediaRecorderRef.current?.state === "inactive") {
              mediaRecorderRef.current.start();
            }
          }, 100);
        }
      }, 2000);

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg transition-colors z-50 flex items-center justify-center ${
        isRecording
          ? "bg-red-500 hover:bg-red-600"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      <Mic className="text-white w-6 h-6" />
    </button>
  );
}
