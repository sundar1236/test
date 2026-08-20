import { useState, useEffect, useRef, useCallback } from 'react';

interface UseExamTimerOptions {
  durationMinutes: number;
  startedAtMs: number;
  onTimerExpire: () => void;
  isPaused?: boolean;
}

export interface UseExamTimerReturn {
  remainingSeconds: number;
  formattedTime: string;
  isExpired: boolean;
  progressPercent: number;
}

export function useExamTimer({
  durationMinutes,
  startedAtMs,
  onTimerExpire,
  isPaused = false,
}: UseExamTimerOptions): UseExamTimerReturn {
  const totalDurationSeconds = Math.max(1, durationMinutes * 60);
  const endTimeMsRef = useRef<number>(startedAtMs + totalDurationSeconds * 1000);
  const hasExpiredRef = useRef<boolean>(false);

  // Re-calculate end time if inputs change
  useEffect(() => {
    endTimeMsRef.current = startedAtMs + totalDurationSeconds * 1000;
  }, [durationMinutes, startedAtMs, totalDurationSeconds]);

  const calculateRemainingSeconds = useCallback(() => {
    const now = Date.now();
    const diff = Math.ceil((endTimeMsRef.current - now) / 1000);
    return Math.max(0, diff);
  }, []);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemainingSeconds());

  useEffect(() => {
    if (isPaused || hasExpiredRef.current) return;

    const tick = () => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onTimerExpire();
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [calculateRemainingSeconds, isPaused, onTimerExpire]);

  // Format HH:MM:SS or MM:SS
  const formatTime = (secs: number): string => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100)
  );

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isExpired: remainingSeconds <= 0,
    progressPercent,
  };
}
