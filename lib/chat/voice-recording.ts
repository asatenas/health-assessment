export interface VoiceRecordingOptions {
  onDataAvailable?: (audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onError?: (error: Error) => void;
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  public options: VoiceRecordingOptions;

  constructor(options: VoiceRecordingOptions = {}) {
    this.options = options;
  }

  async startRecording(): Promise<void> {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: 'audio/webm;codecs=opus',
        });

        this.options.onDataAvailable?.(audioBlob);
        this.options.onRecordingStop?.();
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        this.options.onError?.(error);
        this.cleanup();
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.options.onRecordingStart?.();
    } catch (error) {
      const recordingError =
        error instanceof Error ? error : new Error('Failed to start recording');
      this.options.onError?.(recordingError);
      this.cleanup();
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  cancelRecording(): void {
    this.cleanup();
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
  }
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    // Always try to get user media to trigger permission request
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    // If successful, stop the tracks and return true
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied or not available:', error);
    return false;
  }
}

export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    // Check if permissions API is available
    if (navigator.permissions?.query) {
      const result = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      return result.state === 'granted';
    }
  } catch (error) {
    console.log('Permissions API not available, will try direct access');
  }

  // Fallback: try to access microphone directly
  return requestMicrophonePermission();
}
