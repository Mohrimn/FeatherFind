
export type View = 'identifier' | 'chat';

export interface BirdInfo {
  commonName: string;
  scientificName: string;
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
