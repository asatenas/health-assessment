let audioContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentResolve: (() => void) | null = null;
let currentReject: ((reason?: any) => void) | null = null;

export async function speakText(text: string): Promise<void> {
  try {
    // Stop any currently playing audio
    stopSpeaking();

    // Create audio context if it doesn't exist
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume audio context if it's suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    currentAudio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      currentResolve = resolve;
      currentReject = reject;

      if (!currentAudio) return reject(new Error('Audio creation failed'));

      currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        currentResolve = null;
        currentReject = null;
        resolve();
      };

      currentAudio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        currentResolve = null;
        currentReject = null;
        reject(new Error('Audio playback failed'));
      };

      currentAudio.play().catch(reject);
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Resolve the promise gracefully instead of rejecting
  if (currentResolve) {
    currentResolve();
    currentResolve = null;
    currentReject = null;
  }
}