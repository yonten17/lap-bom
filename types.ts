export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  images?: string[]; // Base64 strings
  isThinking?: boolean;
}

export interface GenerationConfig {
  thinkingBudget?: number;
}
