
export type View = 'identifier' | 'chat' | 'birdsong';

export interface BirdInfo {
  commonName: string;
  scientificName:string;
  description: string;
  habitat: string;
  diet: string;
  funFacts: string[];
  conservationStatus: string;
}

export interface RangeInfo {
  description: string;
  mapsLink?: {
    uri: string;
    title: string;
  };
}

export interface IdentificationResult {
  birdInfo: BirdInfo;
  rangeInfo: RangeInfo;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface BirdsongResult {
  commonName: string;
  scientificName: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  vocalizationNotes: string;
}

export interface QuizQuestion {
  id: number;
  audioSrc: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizStats {
  score: number;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
}
