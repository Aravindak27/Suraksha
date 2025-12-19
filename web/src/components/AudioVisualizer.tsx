import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    isMonitoring: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isMonitoring }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number | null>(null);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Fade effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;

            // Color based on height (louder = redder)
            const r = barHeight + (25 * (i / bufferLength));
            const g = 250 * (i / bufferLength);
            const b = 50;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        if (isMonitoring) {
            rafRef.current = requestAnimationFrame(draw);
        }
    };

    useEffect(() => {
        if (isMonitoring && analyser) {
            draw();
        } else {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            // Clear on stop
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [analyser, isMonitoring]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={200}
            style={{ width: '100%', height: '200px', backgroundColor: '#111', borderRadius: '10px' }}
        />
    );
};
