/**
 * Notification service for Pomodoro timer
 * Handles browser notifications and ocean-themed sound effects
 */

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

/**
 * Get or create the AudioContext (must be created after user interaction)
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Resume the AudioContext if it was suspended (e.g., when tab was backgrounded).
 * Chrome suspends AudioContext in background tabs to save resources.
 * Call this when the tab becomes visible again.
 */
export async function resumeAudioContext(): Promise<void> {
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (err) {
      console.warn('Failed to resume AudioContext:', err);
    }
  }
}

/**
 * Play a gentle wave swoosh sound for timer start
 * Creates a soft, ocean-like whoosh effect
 */
export function playStartSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create a gentle wave-like sound using filtered noise
    const duration = 0.8;

    // Create noise buffer for wave sound
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate pink-ish noise (softer than white noise)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // Low-pass filter to make it sound like a wave
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);

    // Envelope for the swoosh effect
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Add a gentle chime on top
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, now); // C5

    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    // Connect noise path
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Connect chime path
    oscillator.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    // Play
    noise.start(now);
    noise.stop(now + duration);
    oscillator.start(now);
    oscillator.stop(now + 0.6);
  } catch (error) {
    console.warn('Could not play start sound:', error);
  }
}

/**
 * Play a pleasant completion sound - like a gentle bell with ocean undertones
 * Not jarring, more like a soft wind chime at the beach
 */
export function playCompleteSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Play a pleasant three-note chime (like wind chimes)
    const notes = [
      { freq: 659.25, delay: 0, duration: 1.5 },      // E5
      { freq: 783.99, delay: 0.15, duration: 1.3 },   // G5
      { freq: 1046.50, delay: 0.3, duration: 1.8 },   // C6
    ];

    notes.forEach(({ freq, delay, duration }) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + delay);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.2, now + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now + delay);
      oscillator.stop(now + delay + duration);
    });

    // Add a gentle wave background
    const waveDuration = 2;
    const bufferSize = ctx.sampleRate * waveDuration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    noiseGain.gain.linearRampToValueAtTime(0.08, now + 1.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + waveDuration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + waveDuration);
  } catch (error) {
    console.warn('Could not play complete sound:', error);
  }
}

/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a browser notification for timer start
 */
export function showStartNotification(): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification('Pomodoro Started! 🏄', {
    body: 'Time to ride the wave! Focus for 25 minutes.',
    icon: '🌊',
    tag: 'pomo-start',
    requireInteraction: false,
  });
}

/**
 * Show a browser notification when someone else starts a wave
 */
export function showWaveStartedNotification(starterName: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification(`${starterName} started a wave! 🌊`, {
    body: 'Join now to ride together!',
    icon: '🏄',
    tag: 'wave-started',
    requireInteraction: true, // Keep notification visible until user interacts
  });
}

/**
 * Show a browser notification for timer completion
 */
export function showCompleteNotification(): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification('Pomodoro Complete! 🎉', {
    body: 'Great work! Time for a break on the beach.',
    icon: '🏖️',
    tag: 'pomo-complete',
    requireInteraction: true, // Keep notification visible until user interacts
  });
}

/**
 * Notify user that timer has started (sound + browser notification)
 */
export async function notifyTimerStart(): Promise<void> {
  playStartSound();
  await requestNotificationPermission();
  showStartNotification();
}

/**
 * Play a celebratory sound - an uplifting ascending melody with shimmer
 * More triumphant than the standard completion sound
 */
export function playCelebrationSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Play an ascending celebratory arpeggio
    const notes = [
      { freq: 523.25, delay: 0, duration: 0.4 },      // C5
      { freq: 659.25, delay: 0.1, duration: 0.4 },     // E5
      { freq: 783.99, delay: 0.2, duration: 0.4 },     // G5
      { freq: 1046.50, delay: 0.3, duration: 0.8 },    // C6
      { freq: 1318.51, delay: 0.5, duration: 1.2 },    // E6 (triumphant top note)
    ];

    notes.forEach(({ freq, delay, duration }) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + delay);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.18, now + delay + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now + delay);
      oscillator.stop(now + delay + duration);
    });

    // Add a shimmer / sparkle layer
    const shimmerDuration = 2;
    const bufferSize = ctx.sampleRate * shimmerDuration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    noiseGain.gain.linearRampToValueAtTime(0.06, now + 1.0);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + shimmerDuration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + shimmerDuration);
  } catch (error) {
    console.warn('Could not play celebration sound:', error);
  }
}

/**
 * Notify user that timer has completed (sound + browser notification)
 */
export function notifyTimerComplete(): void {
  playCelebrationSound();
  showCompleteNotification();
}

/**
 * Notify user that someone else started a wave (sound + browser notification)
 */
export function notifyWaveStarted(starterName: string): void {
  playStartSound();
  showWaveStartedNotification(starterName);
}
