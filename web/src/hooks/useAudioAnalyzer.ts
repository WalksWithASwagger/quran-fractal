/**
 * useAudioAnalyzer - Web Audio API hook for audio-reactive visualizations
 *
 * Extracts frequency data from microphone input and provides
 * bass, mid, and treble values for driving visual parameters.
 *
 * Audio reactivity creates an immersive, transcendent experience
 * where the sacred geometry responds to sound.
 */

import { useRef, useState, useCallback, useEffect } from 'react';

export interface AudioData {
  bass: number;      // 20-250 Hz - affects glow intensity
  mid: number;       // 250-4000 Hz - affects rotation speed
  treble: number;    // 4000-20000 Hz - affects spark frequency
  overall: number;   // Average amplitude
  waveform: Uint8Array;
  frequencies: Uint8Array;
}

export interface AudioAnalyzerState {
  isActive: boolean;
  hasPermission: boolean;
  error: string | null;
}

const DEFAULT_AUDIO_DATA: AudioData = {
  bass: 0,
  mid: 0,
  treble: 0,
  overall: 0,
  waveform: new Uint8Array(256),
  frequencies: new Uint8Array(256),
};

export function useAudioAnalyzer() {
  const [state, setState] = useState<AudioAnalyzerState>({
    isActive: false,
    hasPermission: false,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataRef = useRef<AudioData>({ ...DEFAULT_AUDIO_DATA });

  // Smoothing for more pleasant visual response
  const smoothedDataRef = useRef<AudioData>({ ...DEFAULT_AUDIO_DATA });
  const smoothingFactor = 0.3; // Higher = more responsive, lower = smoother

  const start = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      streamRef.current = stream;

      // Create audio context and analyzer
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();

      // Configure analyzer
      analyzerRef.current.fftSize = 512;
      analyzerRef.current.smoothingTimeConstant = 0.8;
      analyzerRef.current.minDecibels = -90;
      analyzerRef.current.maxDecibels = -10;

      // Connect microphone to analyzer
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyzerRef.current);

      // Initialize data arrays with correct size
      const bufferLength = analyzerRef.current.frequencyBinCount;
      dataRef.current.frequencies = new Uint8Array(bufferLength);
      dataRef.current.waveform = new Uint8Array(bufferLength);
      smoothedDataRef.current.frequencies = new Uint8Array(bufferLength);
      smoothedDataRef.current.waveform = new Uint8Array(bufferLength);

      setState({
        isActive: true,
        hasPermission: true,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({
        isActive: false,
        hasPermission: false,
        error: `Microphone access denied: ${message}`,
      });
    }
  }, []);

  const stop = useCallback(() => {
    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyzerRef.current = null;

    // Reset data
    dataRef.current = { ...DEFAULT_AUDIO_DATA };
    smoothedDataRef.current = { ...DEFAULT_AUDIO_DATA };

    setState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  const getData = useCallback((): AudioData => {
    if (!analyzerRef.current || !state.isActive || !audioContextRef.current) {
      return smoothedDataRef.current;
    }

    const analyzer = analyzerRef.current;
    const frequencies = dataRef.current.frequencies as Uint8Array<ArrayBuffer>;
    const waveform = dataRef.current.waveform as Uint8Array<ArrayBuffer>;

    // Get raw frequency and time domain data
    analyzer.getByteFrequencyData(frequencies);
    analyzer.getByteTimeDomainData(waveform);

    // Calculate frequency bands
    const nyquist = audioContextRef.current.sampleRate / 2;
    const binSize = nyquist / frequencies.length;

    let bassSum = 0, bassCount = 0;
    let midSum = 0, midCount = 0;
    let trebleSum = 0, trebleCount = 0;

    for (let i = 0; i < frequencies.length; i++) {
      const freq = i * binSize;
      const value = frequencies[i] / 255;

      if (freq < 250) {
        // Bass: 20-250 Hz
        bassSum += value;
        bassCount++;
      } else if (freq < 4000) {
        // Mid: 250-4000 Hz
        midSum += value;
        midCount++;
      } else {
        // Treble: 4000+ Hz
        trebleSum += value;
        trebleCount++;
      }
    }

    // Calculate raw values
    const rawBass = bassCount > 0 ? bassSum / bassCount : 0;
    const rawMid = midCount > 0 ? midSum / midCount : 0;
    const rawTreble = trebleCount > 0 ? trebleSum / trebleCount : 0;
    const rawOverall = (bassSum + midSum + trebleSum) / frequencies.length;

    // Apply smoothing for more pleasant visual response
    const smooth = smoothedDataRef.current;
    smooth.bass = smooth.bass + (rawBass - smooth.bass) * smoothingFactor;
    smooth.mid = smooth.mid + (rawMid - smooth.mid) * smoothingFactor;
    smooth.treble = smooth.treble + (rawTreble - smooth.treble) * smoothingFactor;
    smooth.overall = smooth.overall + (rawOverall - smooth.overall) * smoothingFactor;
    smooth.frequencies = frequencies;
    smooth.waveform = waveform;

    return smooth;
  }, [state.isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isActive) {
        stop();
      }
    };
  }, [state.isActive, stop]);

  return {
    ...state,
    start,
    stop,
    getData,
  };
}

/**
 * Maps audio data to visual parameters
 * Use these helpers to drive visual effects
 */
export const audioToVisual = {
  /**
   * Bass affects glow intensity and particle size
   */
  glowIntensity: (audio: AudioData): number => {
    return 1 + audio.bass * 0.5;
  },

  /**
   * Mid frequencies affect rotation and pattern density
   */
  rotationMultiplier: (audio: AudioData): number => {
    return 1 + audio.mid * 0.3;
  },

  /**
   * Treble affects shimmer and spark frequency
   */
  sparkMultiplier: (audio: AudioData): number => {
    return 1 + audio.treble * 2;
  },

  /**
   * Overall amplitude for general intensity
   */
  overallIntensity: (audio: AudioData): number => {
    return 0.8 + audio.overall * 0.4;
  },
};
