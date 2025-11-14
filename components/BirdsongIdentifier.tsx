import React, { useState, useRef, useEffect, useCallback } from 'react';
import { identifyBirdFromSound } from '../services/geminiService';
import type { BirdsongResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { Spectrogram } from './Spectrogram';

const RECORDING_DURATION = 10000; // 10 seconds

export const BirdsongIdentifier: React.FC = () => {
  // Analyzer State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [results, setResults] = useState<BirdsongResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  
  const cleanup = useCallback(() => {
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
       audioContextRef.current.close();
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
  }, []);


  const visualize = useCallback(() => {
    if (!analyserRef.current || !waveformCanvasRef.current) return;
    const canvas = waveformCanvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    if(!canvasCtx) return;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(243 244 246)'; // gray-100
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(22 163 74)'; // green-600

      canvasCtx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  }, []);


  const handleStartRecording = async () => {
    setError(null);
    setResults(null);
    setAudioBlob(null);
    setAudioUrl(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      visualize();

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        cleanup();
      };
      mediaRecorderRef.current.start();

      setCountdown(RECORDING_DURATION / 1000);
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown(prev => prev-1);
      }, 1000);

      setTimeout(() => {
        handleStopRecording();
      }, RECORDING_DURATION);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied. Please allow microphone permissions in your browser settings.");
      setIsRecording(false);
      cleanup();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if(countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdown(0);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setResults(null);
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const analysisResults = await identifyBirdFromSound(audioBlob);
      setResults(analysisResults);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };
  
  const resetAnalyzer = () => {
      setAudioBlob(null);
      setAudioUrl(null);
      setResults(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Birdsong Analyzer
        </h2>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Record a bird's song or upload an audio file to identify the species.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
          {!audioUrl && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center space-y-4">
              <MicrophoneIcon className={`mx-auto h-12 w-12 text-gray-400 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}/>
              {isRecording ? (
                <div>
                  <p className="text-lg font-semibold">Recording... {countdown}s</p>
                  <canvas ref={waveformCanvasRef} width="300" height="60" className="mx-auto mt-2 bg-gray-100 dark:bg-gray-700 rounded-md"></canvas>
                </div>
              ) : (
                <>
                   <p className="text-sm text-gray-600 dark:text-gray-300">Record a 10-second clip or upload an audio file.</p>
                   <div className="flex justify-center gap-4">
                      <button onClick={handleStartRecording} disabled={isRecording} className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200">Start Recording</button>
                      <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Upload File</button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="sr-only" />
                   </div>
                </>
              )}
            </div>
          )}
          
          {audioUrl && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="font-semibold text-lg">Your Recording</h3>
                  <audio src={audioUrl} controls className="w-full"></audio>
                  <div className="flex gap-4">
                      <button onClick={handleAnalyze} disabled={loading} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">
                          {loading ? <SpinnerIcon /> : null} {loading ? "Analyzing..." : "Analyze Birdsong"}
                      </button>
                      <button onClick={resetAnalyzer} disabled={loading} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                          Start Over
                      </button>
                  </div>
              </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
                <p className="font-bold">Analysis Failed</p>
                <p>{error}</p>
            </div>
          )}

          {results && (
              <div className="space-y-4 animate-fade-in">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-lg mb-4">Audio Spectrogram</h3>
                      <Spectrogram audioBlob={audioBlob}/>
                  </div>
                  <h3 className="text-xl font-bold text-center">Analysis Results</h3>
                  {results.map((r, i) => (
                      <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h4 className="text-lg font-bold text-green-800 dark:text-green-300">{r.commonName}</h4>
                                  <p className="text-sm italic text-gray-500 dark:text-gray-400">{r.scientificName}</p>
                              </div>
                              <span className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${
                                  r.confidence === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  r.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>{r.confidence} Confidence</span>
                          </div>
                          <p className="mt-3 text-gray-600 dark:text-gray-300"><span className="font-semibold">Vocalization Notes:</span> {r.vocalizationNotes}</p>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};