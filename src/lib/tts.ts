
export interface TTSVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

export interface TTSSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

class TTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized = false;
  private settings: TTSSettings = {
    voice: '',
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'en-US'
  };

  constructor() {
    this.synth = window.speechSynthesis;
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;

    // Load voices
    await this.loadVoices();
    
    // Load saved settings
    const savedSettings = localStorage.getItem('tts_settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }

    this.isInitialized = true;
  }

  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoicesHandler = () => {
        this.voices = this.synth.getVoices();
        if (this.voices.length > 0) {
          resolve();
        }
      };

      this.voices = this.synth.getVoices();
      if (this.voices.length > 0) {
        resolve();
      } else {
        this.synth.addEventListener('voiceschanged', loadVoicesHandler);
      }
    });
  }

  getAvailableVoices(): TTSVoice[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
      voiceURI: voice.voiceURI
    }));
  }

  getVoicesByLanguage(language: string): TTSVoice[] {
    return this.getAvailableVoices().filter(voice => 
      voice.lang.startsWith(language) || voice.lang === language
    );
  }

  async speak(text: string, options?: Partial<TTSSettings>): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Stop any current speech
    this.stop();

    const settings = { ...this.settings, ...options };
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find the voice
      const voice = this.voices.find(v => v.voiceURI === settings.voice || v.name === settings.voice);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;
      utterance.lang = settings.language;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (error) => {
        this.currentUtterance = null;
        reject(error);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  pause(): void {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  stop(): void {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }

  updateSettings(newSettings: Partial<TTSSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('tts_settings', JSON.stringify(this.settings));
  }

  getSettings(): TTSSettings {
    return { ...this.settings };
  }

  // Detect language from text content
  detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const patterns = {
      'ar': /[\u0600-\u06FF]/,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'hi': /[\u0900-\u097f]/,
      'th': /[\u0e00-\u0e7f]/,
      'ru': /[\u0400-\u04ff]/,
      'el': /[\u0370-\u03ff]/,
      'he': /[\u0590-\u05ff]/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en';
  }

  // Split text into chunks for better TTS performance
  splitTextIntoChunks(text: string, maxLength: number = 200): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Speak text with automatic language detection and chunking
  async speakIntelligent(text: string, options?: Partial<TTSSettings>): Promise<void> {
    const detectedLanguage = this.detectLanguage(text);
    const chunks = this.splitTextIntoChunks(text);
    
    const enhancedOptions = {
      ...options,
      language: detectedLanguage
    };

    for (const chunk of chunks) {
      await this.speak(chunk, enhancedOptions);
      // Small pause between chunks
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Create audio book-like experience
  async createAudioBook(pages: string[], options?: Partial<TTSSettings>): Promise<void> {
    for (let i = 0; i < pages.length; i++) {
      console.log(`Reading page ${i + 1} of ${pages.length}`);
      await this.speakIntelligent(pages[i], options);
      
      // Pause between pages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export default TTSService;
