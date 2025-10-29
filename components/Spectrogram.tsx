import React, { useRef, useEffect } from 'react';

interface SpectrogramProps {
  audioBlob: Blob | null;
}

export const Spectrogram: React.FC<SpectrogramProps> = ({ audioBlob }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioBlob || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);
        // We don't need to connect to destination to analyze
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        
        // This is a simplified approach to generate a static spectrogram
        const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
        const offlineSource = offlineContext.createBufferSource();
        offlineSource.buffer = audioBuffer;
        
        const offlineAnalyser = offlineContext.createAnalyser();
        offlineAnalyser.fftSize = 256;
        const scp = offlineContext.createScriptProcessor(256, 1, 1);

        offlineSource.connect(offlineAnalyser);
        offlineAnalyser.connect(scp);
        scp.connect(offlineContext.destination);

        const frequencyData = new Uint8Array(offlineAnalyser.frequencyBinCount);
        let x = 0;

        scp.onaudioprocess = () => {
          offlineAnalyser.getByteFrequencyData(frequencyData);
          canvasCtx.fillStyle = 'rgba(0, 0, 0, 1)';
          canvasCtx.fillRect(x, 0, 1, HEIGHT);

          for (let i = 0; i < frequencyData.length; i++) {
            const v = frequencyData[i] / 255.0;
            const y = HEIGHT - (v * HEIGHT);
            const hue = (v * 240);
            canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            canvasCtx.fillRect(x, y, 1, 1);
          }
           x++;
        };
        
        offlineSource.start(0);
        offlineContext.startRendering();

      } catch (err) {
        console.error("Error processing audio for spectrogram:", err);
        canvasCtx.fillStyle = 'black';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillText("Could not process audio data.", 10, 20);
      }
    };
    reader.readAsArrayBuffer(audioBlob);

  }, [audioBlob]);

  return <canvas ref={canvasRef} width="500" height="150" className="bg-black rounded-lg w-full"></canvas>;
};
