export interface TranscriptionResult {
  type?: "transcription";
  timestamp: string;
  transcription?: string;
  status: string;
  error?: string;
}
