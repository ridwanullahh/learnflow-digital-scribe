
import UniversalSDK, { 
  UniversalSDKConfig, 
  User, 
  Session, 
  QueryBuilder,
  CloudinaryUploadResult,
  MediaAttachment 
} from './UniversalSDK';

// SDK Configuration - users will need to provide their own GitHub token and repo details
const sdkConfig: UniversalSDKConfig = {
  owner: process.env.VITE_GITHUB_OWNER || 'your-github-username',
  repo: process.env.VITE_GITHUB_REPO || 'learnflow-db',
  token: process.env.VITE_GITHUB_TOKEN || '',
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
      required: ['email']
    },
    books: {
      types: {
        title: 'string',
        author: 'string',
        content: 'string',
        pages: 'array',
        userId: 'string',
        isPublic: 'boolean',
        createdAt: 'date',
        updatedAt: 'date'
      },
      required: ['title', 'content', 'userId']
    },
    annotations: {
      types: {
        bookId: 'string',
        userId: 'string',
        pageNumber: 'number',
        content: 'string',
        type: 'string',
        position: 'object',
        createdAt: 'date'
      },
      required: ['bookId', 'userId', 'content', 'type']
    },
    aiGeneratedContent: {
      types: {
        bookId: 'string',
        userId: 'string',
        type: 'string',
        content: 'string',
        pageRange: 'object',
        createdAt: 'date'
      },
      required: ['bookId', 'userId', 'type', 'content']
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
      required: ['bookId', 'userId', 'pageNumber']
    }
  },
  auth: {
    requireEmailVerification: false,
    otpTriggers: ['register']
  }
};

// Initialize SDK
export const sdk = new UniversalSDK(sdkConfig);

// Export types for use throughout the app
export type { User, Session, QueryBuilder, CloudinaryUploadResult, MediaAttachment };
export default sdk;
