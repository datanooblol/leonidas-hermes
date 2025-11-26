"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";

interface TranscriptionFloatingIconProps {
  transcriptions: any[];
}

export default function TranscriptionFloatingIcon({ transcriptions }: TranscriptionFloatingIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-colors z-50 flex items-center justify-center"
      >
        <FileText className="text-white w-6 h-6" />
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Live Transcription</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {transcriptions.length === 0 ? (
                <p className="text-gray-500 text-center">No transcriptions yet...</p>
              ) : (
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500 mb-3">
                    Live Transcription ({transcriptions.length} messages)
                  </div>
                  <div className="text-gray-800 leading-relaxed">
                    {transcriptions
                      .filter(t => t.transcription && t.transcription.trim() !== '')
                      .map(t => t.transcription)
                      .join(' ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}