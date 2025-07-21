
export interface Book {
  id: string;
  uid: string;
  title: string;
  author: string;
  content: string;
  pages: BookPage[];
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookPage {
  id: string;
  pageNumber: number;
  content: string;
  annotations: Annotation[];
  blurLayers: BlurLayer[];
}

export interface Annotation {
  id: string;
  bookId: string;
  userId: string;
  pageNumber: number;
  content: string;
  type: 'note' | 'highlight' | 'drawing' | 'text';
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  createdAt: string;
}

export interface BlurLayer {
  id: string;
  pageId: string;
  regions: BlurRegion[];
  difficultyLevel: number;
  isActive: boolean;
}

export interface BlurRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalContent: string;
  userInput?: string;
  isCompleted: boolean;
}

export interface AIGeneratedContent {
  id: string;
  bookId: string;
  userId: string;
  type: 'quiz' | 'flashcard' | 'summary' | 'keypoints' | 'mindmap' | 'translation';
  content: string;
  pageRange: {
    start: number;
    end: number;
  };
  createdAt: string;
}

export interface LearningProgress {
  id: string;
  bookId: string;
  userId: string;
  pageNumber: number;
  difficultyLevel: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  retentionScore: number;
  lastAccessed: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  ttsSettings: {
    voice: string;
    speed: number;
    pitch: number;
  };
  difficultyLevel: number;
  autoSave: boolean;
  offlineMode: boolean;
}

export interface GeminiRequest {
  prompt: string;
  context: string;
  type: 'quiz' | 'flashcard' | 'summary' | 'keypoints' | 'mindmap' | 'translation' | 'explain';
  pageRange?: {
    start: number;
    end: number;
  };
}

export interface GeminiResponse {
  content: string;
  type: string;
  timestamp: string;
  cached: boolean;
}
