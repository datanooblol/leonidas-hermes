export interface TranscriptionResult {
  type?: "transcription" | "summary";
  timestamp: string;
  transcription?: string;
  summary?: string;
  status: string;
  error?: string;
}
