
import UniversalSDK, { 
  UniversalSDKConfig, 
  User, 
  Session, 
  QueryBuilder,
  CloudinaryUploadResult,
  MediaAttachment 
} from './UniversalSDK';

// SDK Configuration with environment variables
const sdkConfig: UniversalSDKConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || 'your-github-username',
  repo: import.meta.env.VITE_GITHUB_REPO || 'learnflow-db',
  token: import.meta.env.VITE_GITHUB_TOKEN || '',
  branch: 'main',
  basePath: 'db',
  mediaPath: 'media',
  schemas: {
    users: {
      types: {
        email: 'string',
        password: 'string',
        name: 'string',
        preferences: 'object',
        createdAt: 'date',
        updatedAt: 'date'
      },
      required: ['email'],
      defaults: {
        preferences: {
          theme: 'light',
          language: 'en',
          difficultyLevel: 1,
          autoSave: true,
          offlineMode: false,
          ttsSettings: {
            voice: '',
            speed: 1,
            pitch: 1
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    books: {
      types: {
        title: 'string',
        author: 'string',
        content: 'string',
        pages: 'array',
        userId: 'string',
        isPublic: 'boolean',
        category: 'string',
        language: 'string',
        readingProgress: 'number',
        totalPages: 'number',
        coverImage: 'string',
        createdAt: 'date',
        updatedAt: 'date'
      },
      required: ['title', 'content', 'userId'],
      defaults: {
        isPublic: false,
        readingProgress: 0,
        totalPages: 1,
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    annotations: {
      types: {
        bookId: 'string',
        userId: 'string',
        pageNumber: 'number',
        content: 'string',
        type: 'string',
        position: 'object',
        color: 'string',
        createdAt: 'date'
      },
      required: ['bookId', 'userId', 'content', 'type'],
      defaults: {
        pageNumber: 1,
        color: '#ffeb3b',
        createdAt: new Date().toISOString()
      }
    },
    aiGeneratedContent: {
      types: {
        bookId: 'string',
        userId: 'string',
        type: 'string',
        content: 'string',
        pageRange: 'object',
        cached: 'boolean',
        createdAt: 'date'
      },
      required: ['bookId', 'userId', 'type', 'content'],
      defaults: {
        cached: true,
        createdAt: new Date().toISOString()
      }
    },
    learningProgress: {
      types: {
        bookId: 'string',
        userId: 'string',
        pageNumber: 'number',
        difficultyLevel: 'number',
        completionStatus: 'string',
        retentionScore: 'number',
        lastAccessed: 'date'
      },
      required: ['bookId', 'userId', 'pageNumber'],
      defaults: {
        difficultyLevel: 1,
        completionStatus: 'started',
        retentionScore: 0,
        lastAccessed: new Date().toISOString()
      }
    },
    flashcards: {
      types: {
        bookId: 'string',
        userId: 'string',
        question: 'string',
        answer: 'string',
        difficulty: 'number',
        nextReview: 'date',
        repetitions: 'number',
        createdAt: 'date'
      },
      required: ['bookId', 'userId', 'question', 'answer'],
      defaults: {
        difficulty: 1,
        repetitions: 0,
        nextReview: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    },
    quizzes: {
      types: {
        bookId: 'string',
        userId: 'string',
        title: 'string',
        questions: 'array',
        pageRange: 'object',
        score: 'number',
        completedAt: 'date',
        createdAt: 'date'
      },
      required: ['bookId', 'userId', 'title', 'questions'],
      defaults: {
        score: 0,
        createdAt: new Date().toISOString()
      }
    }
  },
  auth: {
    requireEmailVerification: false,
    otpTriggers: []
  }
};

// Initialize SDK and handle empty repositories
export const initializeSDK = async () => {
  const sdk = new UniversalSDK(sdkConfig);
  await sdk.init();
  
  // The SDK now handles initialization internally
  return sdk;
};

// Export the SDK instance
export const sdk = new UniversalSDK(sdkConfig);

// Export types for use throughout the app
export type { User, Session, QueryBuilder, CloudinaryUploadResult, MediaAttachment };
export default sdk;
