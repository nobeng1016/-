
export interface BlogContent {
  seoTitles: string[];
  keywords: string[];
  intro: string;
  body: string;
  humorComment: string;
  summary: string;
  raw: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  topic: string;
  status: 'Published' | 'Draft';
  platform?: 'Naver' | 'Tistory';
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  WRITING = 'WRITING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ImagePrompt {
  prompt: string;
  alt: string;
  generatedUrl?: string;
  isGenerating?: boolean;
}
