import { useState, useRef, useEffect } from 'react';

export interface AudioStats {
    db: number;
    isEmergency: boolean;
}

export const useAudioMonitor = (thresholdDb: number = 80) => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [stats, setStats] = useState<AudioStats>({ db: 0, isEmergency: false });

    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);

    // Buffer for smoothing
    const dataArrayRef = useRef<Uint8Array | null>(null);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Artificial Gain to boost signal
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 50.0; // 50x boost (Software Pre-amp)

            source.connect(gainNode);
            gainNode.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            dataArrayRef.current = dataArray;

            setIsMonitoring(true);
            analyze();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied or error occurred.");
        }
    };

    const stop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        setIsMonitoring(false);
        setStats({ db: 0, isEmergency: false });
    };

    const analyze = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

        // Calculate RMS (roughly)
        // Note: getByteFrequencyData gives 0-255. 
        // For accurate dB, we usually use getFloatTimeDomainData, but for visualizer simple avg is fine for "demo"
        // Let's use TimeDomain for better Volume detection

        // Use Float32 for better precision (removes the ~58dB "8-bit floor")
        const bufferLength = analyserRef.current.fftSize;
        const floatData = new Float32Array(bufferLength);

        // Fallback or use standard method
        if (analyserRef.current.getFloatTimeDomainData) {
            analyserRef.current.getFloatTimeDomainData(floatData);
        } else {
            // Fallback for very old browsers (unlikely)
            const byteData = new Uint8Array(bufferLength);
            analyserRef.current.getByteTimeDomainData(byteData);
            for (let i = 0; i < bufferLength; i++) {
                floatData[i] = (byteData[i] - 128) / 128.0;
            }
        }

        // Calculate Root Mean Square (RMS)
        let sum = 0;
        for (let i = 0; i < floatData.length; i++) {
            sum += floatData[i] * floatData[i];
        }
        const rms = Math.sqrt(sum / floatData.length);

        // Convert RMS to dB
        // Reference: 0dBFS is max. 
        // We map -60dBFS (quiet) to 30dB display, and 0dBFS to 90dB display?
        // Let's stick to standard approx: 20 * log10(rms) + Offset
        // Offset of 100 puts max at 100dB, and noise floor (0.0001) at ~20dB.

        let db = 0;
        if (rms > 0) {
            db = 20 * Math.log10(rms) + 100;
        }

        if (rms > 0) {
            db = 20 * Math.log10(rms) + 100;
        }

        // Debug Log (Throttle to avoid spamming 60fps)
        if (Math.random() < 0.05) {
            console.log(`[AudioMonitor] RMS: ${rms.toFixed(5)} | dB: ${db.toFixed(1)}`);
        }

        // Clamp min val to avoid flapping
        if (db < 0) db = 0;

        setStats(prev => ({
            db,
            isEmergency: db > thresholdDb || (prev.isEmergency && db > thresholdDb - 5) // Simple latch/hysteresis
        }));

        rafRef.current = requestAnimationFrame(analyze);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    return { start, stop, isMonitoring, stats, analyser: analyserRef.current };
};
