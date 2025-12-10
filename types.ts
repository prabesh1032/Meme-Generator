export interface MemeContent {
  topText: string;
  bottomText: string;
  imagePrompt: string;
}

export interface GeneratedMeme {
  id: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
  timestamp: number;
  topic: string;
}

export interface MemeTemplate {
  id: string;
  url: string;
  name: string;
  description: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type GenerationMode = 'AI' | 'TEMPLATE';
