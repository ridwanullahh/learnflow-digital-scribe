
import { GeminiRequest, GeminiResponse } from '../types';

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly maxRequestsPerMinute = 10; // Leave buffer for 11 req/min limit

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Reset counter if more than a minute has passed
    const now = Date.now();
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Process requests within rate limit
    while (this.requestQueue.length > 0 && this.requestCount < this.maxRequestsPerMinute) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
          this.requestCount++;
        } catch (error) {
          console.error('Gemini request failed:', error);
        }
      }
    }

    this.isProcessing = false;
    
    // Schedule next batch if queue not empty
    if (this.requestQueue.length > 0) {
      const delay = 60000 - (Date.now() - this.lastResetTime);
      setTimeout(() => this.processQueue(), Math.max(delay, 1000));
    }
  }

  private async makeRequest(request: GeminiRequest): Promise<GeminiResponse> {
    // Check local cache first
    const cacheKey = `gemini_${JSON.stringify(request)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cachedResponse = JSON.parse(cached);
      if (Date.now() - new Date(cachedResponse.timestamp).getTime() < 24 * 60 * 60 * 1000) {
        return { ...cachedResponse, cached: true };
      }
    }

    return new Promise((resolve, reject) => {
      const requestFn = async () => {
        try {
          const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: this.buildPrompt(request)
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              }
            })
          });

          if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
          }

          const data = await response.json();
          const content = data.candidates[0]?.content?.parts[0]?.text || '';
          
          const geminiResponse: GeminiResponse = {
            content,
            type: request.type,
            timestamp: new Date().toISOString(),
            cached: false
          };

          // Cache the response
          localStorage.setItem(cacheKey, JSON.stringify(geminiResponse));
          
          resolve(geminiResponse);
        } catch (error) {
          reject(error);
        }
      };

      this.requestQueue.push(requestFn);
      this.processQueue();
    });
  }

  private buildPrompt(request: GeminiRequest): string {
    const basePrompt = `Context: ${request.context}\n\nUser Request: ${request.prompt}\n\n`;
    
    switch (request.type) {
      case 'quiz':
        return `${basePrompt}Generate a comprehensive quiz with multiple choice, true/false, and short answer questions based on the provided content. Include answer key and explanations.`;
      
      case 'flashcard':
        return `${basePrompt}Create flashcards from the content. Each flashcard should have a clear question/term on one side and a concise answer/definition on the other. Format as JSON with 'front' and 'back' properties.`;
      
      case 'summary':
        return `${basePrompt}Provide a comprehensive summary of the content, highlighting the main points, key concepts, and important details in a structured format.`;
      
      case 'keypoints':
        return `${basePrompt}Extract the key points from the content and present them as a bulleted list with clear, concise explanations for each point.`;
      
      case 'mindmap':
        return `${basePrompt}Create a mind map structure from the content. Return as JSON with hierarchical nodes, each having 'title', 'children', and 'connections' properties.`;
      
      case 'translation':
        return `${basePrompt}Translate the content while preserving the meaning, context, and technical terms. Maintain the original structure and formatting.`;
      
      case 'explain':
        return `${basePrompt}Provide a detailed explanation of the content, breaking down complex concepts into simpler terms and providing examples where appropriate.`;
      
      default:
        return basePrompt;
    }
  }

  async generateQuiz(context: string, pageRange?: { start: number; end: number }): Promise<GeminiResponse> {
    return this.makeRequest({
      prompt: 'Generate a quiz based on this content',
      context,
      type: 'quiz',
      pageRange
    });
  }

  async generateFlashcards(context: string, pageRange?: { start: number; end: number }): Promise<GeminiResponse> {
    return this.makeRequest({
      prompt: 'Create flashcards from this content',
      context,
      type: 'flashcard',
      pageRange
    });
  }

  async generateSummary(context: string, pageRange?: { start: number; end: number }): Promise<GeminiResponse> {
    return this.makeRequest({
      prompt: 'Summarize this content',
      context,
      type: 'summary',
      pageRange
    });
  }

  async generateKeypoints(context: string, pageRange?: { start: number; end: number }): Promise<GeminiResponse> {
    return this.makeRequest({
      prompt: 'Extract key points from this content',
      context,
      type: 'keypoints',
      pageRange
    });
  }

  async generateMindmap(context: string, pageRange?: { start: number; end: number }): Promise<GeminiResponse> {
    return this.makeRequest({
      prompt: 'Create a mind map from this content',
      context,
      type: 'mindmap',
      pageRange
    });
  }

  async translateContent(context: string, targetLanguage: string, pageRange?: { start: number; end: number }): Promise<GeminiResponse> {
    return this.makeRequest({
      prompt: `Translate this content to ${targetLanguage}`,
      context,
      type: 'translation',
      pageRange
    });
  }

  async explainContent(context: string, query: string, pageRange?: { start: number; end: number }): Promise<GeminiResponse> {
    return this.makeRequest({
      prompt: `Explain: ${query}`,
      context,
      type: 'explain',
      pageRange
    });
  }

  // Clear old cached responses
  clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('gemini_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get cache statistics
  getCacheStats() {
    const keys = Object.keys(localStorage);
    const geminiKeys = keys.filter(key => key.startsWith('gemini_'));
    return {
      totalCached: geminiKeys.length,
      cacheSize: geminiKeys.reduce((size, key) => size + (localStorage.getItem(key) || '').length, 0)
    };
  }
}

export default GeminiService;
