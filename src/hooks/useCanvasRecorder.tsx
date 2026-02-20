import { useState, useRef, useCallback } from 'react';

export interface RecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
}

export const useCanvasRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async (canvas: HTMLCanvasElement, options?: RecordingOptions) => {
    try {
      // Get canvas stream at 1080p (1920x1080) at 30fps
      const stream = canvas.captureStream(30);
      streamRef.current = stream;

      const mimeType = options?.mimeType || 'video/webm;codecs=vp9';
      const videoBitsPerSecond = options?.videoBitsPerSecond || 8000000; // 8 Mbps for 1080p

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setIsRecording(false);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(100); // Capture in 100ms chunks
      setIsRecording(true);
      setRecordedBlob(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    setRecordedBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    reset,
  };
};
