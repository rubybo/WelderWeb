export enum ViewState {
  HOME = 'HOME',
  MODULES = 'MODULES',
  ANALYZER = 'ANALYZER',
  CHAT = 'CHAT',
  SAFETY = 'SAFETY',
  MATERIALS = 'MATERIALS',
  PRACTICE = 'PRACTICE',
  GAME = 'GAME',
  TRAINING = 'TRAINING',
  SAFETY_TRAINING = 'SAFETY_TRAINING'
}

export interface WeldingModule {
  id: string;
  title: string;
  shortDescription: string;
  content: string; // Markdown-like content
  image: string;
  difficulty: 'Новичок' | 'Любитель' | 'Профи';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface AnalysisResult {
  text: string;
  imageUrl: string;
}
