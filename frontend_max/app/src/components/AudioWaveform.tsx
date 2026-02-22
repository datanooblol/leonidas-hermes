'use client';

import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

export const AudioWaveform = ({ analyserNode, isPlaying, progress, duration }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyserNode || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `hsl(${(i / dataArray.length) * 360}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        className="w-full border border-gray-600 rounded bg-black"
      />
      <div className="flex justify-between text-sm text-gray-400 mt-2">
        <span>{formatTime((progress / 100) * duration)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="w-full bg-gray-700 rounded h-1 mt-2">
        <div
          className="bg-blue-500 h-1 rounded transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
