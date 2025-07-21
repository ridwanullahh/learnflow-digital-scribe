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

import { v4 as uuidv4 } from 'uuid';

export interface UniversalSDKConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
  basePath: string;
  mediaPath: string;
  schemas: {
    [collectionName: string]: {
      types: {
        [fieldName: string]: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
      };
      required: string[];
      defaults: {
        [fieldName: string]: any;
      };
    };
  };
  auth: {
    requireEmailVerification: boolean;
    otpTriggers: string[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
}

export interface QueryBuilder {
  where: (condition: (item: any) => boolean) => QueryBuilder;
  sort: (field: string, order: 'asc' | 'desc') => QueryBuilder;
  limit: (count: number) => QueryBuilder;
  exec: () => Promise<any[]>;
}

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

export interface MediaAttachment {
  id: string;
  userId: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export default class UniversalSDK {
  private owner: string;
  private repo: string;
  private token: string;
  private branch: string;
  private basePath: string;
  private mediaPath: string;
  private schemas: {
    [collectionName: string]: {
      types: {
        [fieldName: string]: string;
      };
      required: string[];
      defaults: {
        [fieldName: string]: any;
      };
    };
  };
  private auth: {
    requireEmailVerification: boolean;
    otpTriggers: string[];
  };
  private writeQueue: {
    path: string;
    content: string;
    message: string;
  }[] = [];
  private isQueueProcessing = false;

  constructor(config: UniversalSDKConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
    this.token = config.token;
    this.branch = config.branch;
    this.basePath = config.basePath;
    this.mediaPath = config.mediaPath;
    this.schemas = config.schemas;
    this.auth = config.auth;
  }

  private encodeContent(content: string): string {
    // Handle non-Latin1 characters by using TextEncoder and base64
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(content);
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  }

  private decodeContent(base64Content: string): string {
    try {
      const binaryString = atob(base64Content);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(uint8Array);
    } catch (error) {
      console.error('Decode error:', error);
      return atob(base64Content); // Fallback to simple base64 decode
    }
  }

  private async request(path: string, method: string, body?: any): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    const headers: { [key: string]: string } = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    let response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });
    } catch (error) {
      console.error(`Network error for ${url}:`, error);
      throw error;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`GitHub API error for ${url}:`, response.status, response.statusText, errorBody);
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    try {
      return await response.json();
    } catch (error) {
      console.error(`Failed to parse JSON response from ${url}:`, error, await response.text());
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private queueWrite(path: string, content: string, message: string): void {
    this.writeQueue.push({ path, content, message });
    if (!this.isQueueProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    while (this.writeQueue.length > 0) {
      const operation = this.writeQueue.shift()!;
      const { path, content, message } = operation;
      
      try {
        let existingFile;
        try {
          existingFile = await this.request(path, 'GET');
        } catch (error) {
          existingFile = null;
        }

        const body: any = {
          message,
          content: this.encodeContent(content),
          branch: this.branch,
        };

        if (existingFile?.sha) {
          body.sha = existingFile.sha;
        }

        await this.request(path, 'PUT', body);
        await this.sleep(200); // Rate limiting
      } catch (error) {
        console.error(`Failed to process queue item for ${path}:`, error);
        throw error;
      }
    }
  }

  async insert(collectionName: string, data: any): Promise<any> {
    if (!this.schemas || !this.schemas[collectionName]) {
      throw new Error(`Schema for collection ${collectionName} not found`);
    }

    const schema = this.schemas[collectionName];
    const newItem: any = { id: uuidv4() };

    // Apply defaults
    if (schema.defaults) {
      Object.keys(schema.defaults).forEach(field => {
        newItem[field] = schema.defaults[field];
      });
    }

    // Validate required fields
    schema.required.forEach(field => {
      if (data[field] === undefined) {
        throw new Error(`Missing required field ${field} in collection ${collectionName}`);
      }
    });

    // Add provided data
    Object.assign(newItem, data);

    const path = `${this.basePath}/${collectionName}.json`;

    try {
      const collectionData = await this.get(collectionName);
      collectionData.push(newItem);
      this.queueWrite(path, JSON.stringify(collectionData, null, 2), `Add item to ${collectionName}`);
      return newItem;
    } catch (error) {
      console.error(`Failed to insert into ${collectionName}:`, error);
      throw error;
    }
  }

  async get(collectionName: string): Promise<any[]> {
    const path = `${this.basePath}/${collectionName}.json`;
    try {
      const response = await this.request(path, 'GET');
      const content = this.decodeContent(response.content);
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to get collection ${collectionName}:`, error);
      return [];
    }
  }

  async getItem(collectionName: string, itemId: string): Promise<any> {
    try {
      const collection = await this.get(collectionName);
      return collection.find((item: any) => item.id === itemId);
    } catch (error) {
      console.error(`Failed to get item ${itemId} from ${collectionName}:`, error);
      return null;
    }
  }

  async update(collectionName: string, itemId: string, newData: any): Promise<void> {
    const path = `${this.basePath}/${collectionName}.json`;

    try {
      const collection = await this.get(collectionName);
      const itemIndex = collection.findIndex((item: any) => item.id === itemId);

      if (itemIndex === -1) {
        throw new Error(`Item ${itemId} not found in collection ${collectionName}`);
      }

      const updatedItem = { ...collection[itemIndex], ...newData };
      collection[itemIndex] = updatedItem;

      this.queueWrite(path, JSON.stringify(collection, null, 2), `Update item ${itemId} in ${collectionName}`);
    } catch (error) {
      console.error(`Failed to update item ${itemId} in ${collectionName}:`, error);
      throw error;
    }
  }

  async delete(collectionName: string, itemId: string): Promise<void> {
    const path = `${this.basePath}/${collectionName}.json`;

    try {
      const collection = await this.get(collectionName);
      const itemIndex = collection.findIndex((item: any) => item.id === itemId);

      if (itemIndex === -1) {
        throw new Error(`Item ${itemId} not found in collection ${collectionName}`);
      }

      collection.splice(itemIndex, 1);
      this.queueWrite(path, JSON.stringify(collection, null, 2), `Delete item ${itemId} from ${collectionName}`);
    } catch (error) {
      console.error(`Failed to delete item ${itemId} from ${collectionName}:`, error);
      throw error;
    }
  }

  queryBuilder(collectionName: string): QueryBuilder {
    let items: any[] = [];
    let filters: ((item: any) => boolean)[] = [];
    let sortField: string | null = null;
    let sortOrder: 'asc' | 'desc' = 'asc';
    let limitCount: number | null = null;

    const builder: QueryBuilder = {
      where: (condition: (item: any) => boolean) => {
        filters.push(condition);
        return builder;
      },
      sort: (field: string, order: 'asc' | 'desc') => {
        sortField = field;
        sortOrder = order;
        return builder;
      },
      limit: (count: number) => {
        limitCount = count;
        return builder;
      },
      exec: async () => {
        try {
          items = await this.get(collectionName);
          
          // Apply filters
          items = items.filter(item => filters.every(filter => filter(item)));
          
          // Apply sorting
          if (sortField) {
            items.sort((a: any, b: any) => {
              const aValue = a[sortField];
              const bValue = b[sortField];
              
              if (aValue === bValue) return 0;
              
              if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : 1;
              } else {
                return aValue > bValue ? -1 : 1;
              }
            });
          }
          
          // Apply limit
          if (limitCount !== null) {
            items = items.slice(0, limitCount);
          }
          
          return items;
        } catch (error) {
          console.error(`Query failed on ${collectionName}:`, error);
          return [];
        }
      }
    };

    return builder;
  }

  async uploadMedia(file: File): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'learnflow'); // Replace with your upload preset

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.owner}/image/upload`, { // Replace with your Cloudinary cloud name
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Cloudinary upload error:', response.status, response.statusText, errorBody);
        throw new Error(`Cloudinary upload error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload media to Cloudinary:', error);
      throw error;
    }
  }

  async attachMedia(userId: string, file: CloudinaryUploadResult, filename: string): Promise<MediaAttachment> {
    const attachment: MediaAttachment = {
      id: uuidv4(),
      userId: userId,
      filename: filename,
      url: file.secure_url,
      type: file.resource_type,
      size: file.bytes,
      createdAt: new Date().toISOString(),
    };

    const path = `${this.mediaPath}/${userId}.json`;

    try {
      let mediaList: MediaAttachment[] = [];
      try {
        mediaList = await this.getMedia(userId);
      } catch (mediaError) {
        // Ignore error, assume it's a new user
      }

      mediaList.push(attachment);
      this.queueWrite(path, JSON.stringify(mediaList, null, 2), `Attach media ${filename} to user ${userId}`);
      return attachment;
    } catch (error) {
      console.error(`Failed to attach media ${filename} to user ${userId}:`, error);
      throw error;
    }
  }

  async getMedia(userId: string): Promise<MediaAttachment[]> {
    const path = `${this.mediaPath}/${userId}.json`;
    try {
      const response = await this.request(path, 'GET');
	  if (!response || !response.content) {
		  return [];
	  }
      const content = this.decodeContent(response.content);
      return JSON.parse(content);
    } catch (error) {
      console.warn(`No media found for user ${userId}:`, error);
      return []; // Return empty array if no media found
    }
  }

  async init(): Promise<UniversalSDK> {
    try {
      // Check if repository has content
      await this.request('', 'GET');
    } catch (error) {
      if (error instanceof Error && error.message.includes('empty')) {
        console.log('Initializing empty repository...');
        
        // Create the db directory with a README
        await this.request(`${this.basePath}/README.md`, 'PUT', {
          message: 'Initialize LearnFlow database',
          content: this.encodeContent('# LearnFlow Database\n\nThis directory contains the LearnFlow application data.'),
          branch: this.branch,
        });
      }
    }
    
    // Auto-create collections if they don't exist
    const collections = Object.keys(this.schemas || {});
    for (const collection of collections) {
      try {
        const data = await this.get(collection);
        if (data.length === 0) {
          // Collection exists but is empty, that's fine
          console.log(`Collection ${collection} exists but is empty`);
        }
      } catch (error) {
        // Collection doesn't exist, create it with empty array
        console.log(`Creating collection: ${collection}`);
        await this.request(`${this.basePath}/${collection}.json`, 'PUT', {
          message: `Initialize ${collection} collection`,
          content: this.encodeContent(JSON.stringify([], null, 2)),
          branch: this.branch,
        });
      }
    }
    
    return this;
  }
}
