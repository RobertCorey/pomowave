import { useState, useEffect, useRef, useCallback } from 'react';
import { resumeAudioContext } from '../services/notifications';

interface UseBackgroundTimerOptions {
  endsAt: number | null;
  onComplete?: () => void;
}

interface UseBackgroundTimerResult {
  timeRemaining: number | null;
}

/**
 * A timer hook designed to work reliably even when Chrome suspends background tabs.
 *
 * Key strategies:
 * 1. Pre-schedules the completion callback with setTimeout for the exact end time
 * 2. Uses Page Visibility API to immediately recalculate when tab becomes visible
 * 3. Calculates time remaining from the absolute end timestamp (not by decrementing)
 * 4. Attempts to resume AudioContext when tab becomes visible
 */
export function useBackgroundTimer({
  endsAt,
  onComplete
}: UseBackgroundTimerOptions): UseBackgroundTimerResult {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);
  const lastEndsAtRef = useRef<number | null>(null);

  // Calculate time remaining from absolute timestamp
  const calculateRemaining = useCallback(() => {
    if (endsAt === null) return null;
    return Math.max(0, endsAt - Date.now());
  }, [endsAt]);

  // Handle timer completion
  const handleComplete = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setTimeRemaining(0);
    onComplete?.();
  }, [onComplete]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Schedule the completion callback
  const scheduleCompletion = useCallback((remaining: number) => {
    // Clear any existing completion timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }

    if (remaining <= 0) {
      handleComplete();
      return;
    }

    // Schedule completion for the exact remaining time
    // Add a small buffer (100ms) to ensure we're past the end time
    completionTimeoutRef.current = setTimeout(() => {
      handleComplete();
    }, remaining + 100);
  }, [handleComplete]);

  // Main effect for timer management
  useEffect(() => {
    // Reset completion flag when timer changes
    if (endsAt !== lastEndsAtRef.current) {
      hasCompletedRef.current = false;
      lastEndsAtRef.current = endsAt;
    }

    if (endsAt === null) {
      clearTimers();
      setTimeRemaining(null);
      return;
    }

    const remaining = calculateRemaining();
    if (remaining === null) return;

    // Set initial value
    setTimeRemaining(remaining);

    // Check if already completed
    if (remaining <= 0) {
      handleComplete();
      return;
    }

    // Pre-schedule the completion callback
    scheduleCompletion(remaining);

    // Set up interval for UI updates (this will be throttled in background, but that's OK)
    intervalRef.current = setInterval(() => {
      const newRemaining = calculateRemaining();
      if (newRemaining === null) return;

      setTimeRemaining(newRemaining);

      if (newRemaining <= 0) {
        handleComplete();
      }
    }, 1000);

    return () => {
      clearTimers();
    };
  }, [endsAt, calculateRemaining, handleComplete, scheduleCompletion, clearTimers]);

  // Handle visibility changes - immediately recalculate when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && endsAt !== null) {
        const remaining = calculateRemaining();
        if (remaining === null) return;

        setTimeRemaining(remaining);

        // Check if timer completed while we were in background
        if (remaining <= 0 && !hasCompletedRef.current) {
          handleComplete();
        } else if (remaining > 0) {
          // Re-schedule completion in case the old timeout was delayed
          scheduleCompletion(remaining);
        }

        // Try to resume AudioContext if it was suspended
        // This is needed because Chrome suspends AudioContext in background tabs
        resumeAudioContext();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [endsAt, calculateRemaining, handleComplete, scheduleCompletion]);

  return { timeRemaining };
}

export default useBackgroundTimer;
