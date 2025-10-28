
import React, { useState, useRef, useCallback } from 'react';
import { identifyBirdFromImage, getBirdDetails, getBirdRange } from '../services/geminiService';
import type { IdentificationResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CameraIcon } from './icons/CameraIcon';
import { MapPinIcon } from './icons/MapPinIcon';

export const BirdIdentifier: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResult(null);
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentify = useCallback(async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const birdName = await identifyBirdFromImage(imageFile);
      
      const [birdInfo, rangeInfo] = await Promise.all([
          getBirdDetails(birdName),
          getBirdRange(birdName)
      ]);

      setResult({ birdInfo, rangeInfo });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Bird Species Identifier
        </h2>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Upload a photo of a bird, and our AI will identify it for you.
        </p>
      </div>

      {!imagePreview && (
        <div className="max-w-lg mx-auto p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
          <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Click to upload a photo
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="sr-only"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
          >
            Select Image
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg space-y-4">
          <img src={imagePreview} alt="Bird preview" className="rounded-lg w-full h-auto object-cover" />
          <div className="flex gap-4">
            <button
              onClick={handleIdentify}
              disabled={loading}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading && <SpinnerIcon />}
              {loading ? 'Analyzing...' : 'Identify Bird'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200"
            >
              Choose New Image
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-lg mx-auto p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
            <p className="font-bold">Identification Failed</p>
            <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <div className="p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">{result.birdInfo.commonName}</h3>
            <p className="text-md italic text-gray-500 dark:text-gray-400">{result.birdInfo.scientificName}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300">{result.birdInfo.description}</p>
                  
                  <h4 className="font-semibold text-lg pt-2">Fun Facts</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    {result.birdInfo.funFacts.map((fact, i) => <li key={i}>{fact}</li>)}
                  </ul>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h4 className="font-semibold text-lg">Habitat</h4>
                  <p className="text-gray-600 dark:text-gray-300">{result.birdInfo.habitat}</p>
                </div>
                 <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h4 className="font-semibold text-lg">Diet</h4>
                  <p className="text-gray-600 dark:text-gray-300">{result.birdInfo.diet}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <h4 className="font-semibold text-lg">Conservation Status</h4>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">{result.birdInfo.conservationStatus}</p>
                </div>
              </div>
          </div>
          <div className="p-6 sm:p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="font-semibold text-lg flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-green-600" /> Geographic Range</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{result.rangeInfo.description}</p>
                {result.rangeInfo.mapsLink && (
                    <a 
                        href={result.rangeInfo.mapsLink.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-green-600 dark:text-green-400 font-medium hover:underline"
                    >
                        View on Google Maps: {result.rangeInfo.mapsLink.title}
                    </a>
                )}
            </div>
        </div>
      )}

    </div>
  );
};
