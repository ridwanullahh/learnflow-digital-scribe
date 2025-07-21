interface CloudinaryConfig {
  uploadPreset?: string;
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

interface SMTPConfig {
  endpoint?: string;
  from?: string;
  test?: () => Promise<boolean>;
}

interface PaystackConfig {
  publicKey: string;
  secretKey: string;
}

interface StripeConfig {
  publicKey: string;
  secretKey: string;
}

interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
}

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

interface PaypalConfig {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
}

interface PaymentGatewayConfig {
  paystack?: PaystackConfig;
  stripe?: StripeConfig;
  flutterwave?: FlutterwaveConfig;
  razorpay?: RazorpayConfig;
  paypal?: PaypalConfig;
}

interface AuthConfig {
  requireEmailVerification?: boolean;
  otpTriggers?: string[];
}

interface SchemaDefinition {
  required?: string[];
  types?: Record<string, string>;
  defaults?: Record<string, any>;
}

interface UniversalSDKConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
  basePath?: string;
  mediaPath?: string;
  cloudinary?: CloudinaryConfig;
  smtp?: SMTPConfig;
  templates?: Record<string, string>;
  schemas?: Record<string, SchemaDefinition>;
  auth?: AuthConfig;
  paymentGateways?: PaymentGatewayConfig;
}

interface User {
  id?: string;
  uid?: string;
  email: string;
  password?: string;
  googleId?: string;
  verified?: boolean;
  roles?: string[];
  permissions?: string[];
  schoolId?: string;
  [key: string]: any;
}

interface Session {
  token: string;
  user: User;
  created: number;
}

interface OTPRecord {
  otp: string;
  created: number;
  reason: string;
}

interface AuditLogEntry {
  action: string;
  data: any;
  timestamp: number;
}

interface QueryBuilder<T = any> {
  where(fn: (item: T) => boolean): QueryBuilder<T>;
  sort(field: string, dir?: 'asc' | 'desc'): QueryBuilder<T>;
  project(fields: string[]): QueryBuilder<Partial<T>>;
  exec(): Promise<T[]>;
}

interface MediaAttachment {
  attachmentId: string;
  mimeType: string;
  isInline: boolean;
  url: string;
  name: string;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  [key: string]: any;
}

interface QueuedWrite {
  collection: string;
  data: any[];
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  retries: number;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from: string;
  headers: Record<string, string>;
}

class UniversalSDK {
  private owner: string;
  private repo: string;
  private token: string;
  private branch: string;
  private basePath: string;
  private mediaPath: string;
  private cloudinary: CloudinaryConfig;
  private smtp: SMTPConfig;
  private paymentGateways: PaymentGatewayConfig;
  private templates: Record<string, string>;
  private schemas: Record<string, SchemaDefinition>;
  private authConfig: AuthConfig;
  private sessionStore: Record<string, Session>;
  private otpMemory: Record<string, OTPRecord>;
  private auditLog: Record<string, AuditLogEntry[]>;
  private cache: Record<string, { data: any[], etag?: string, sha?: string }> = {};
  private subscribers: Record<string, Function[]> = {};
  private pollingIntervals: Record<string, number> = {};
  private writeQueue: QueuedWrite[] = [];
  private isProcessingQueue = false;

  constructor(config: UniversalSDKConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
    this.token = config.token;
    this.branch = config.branch || "main";
    this.basePath = config.basePath || "db";
    this.mediaPath = config.mediaPath || "media";
    this.cloudinary = config.cloudinary || {};
    this.smtp = config.smtp || {};
    this.paymentGateways = config.paymentGateways || {};
    this.templates = config.templates || {};
    this.schemas = {
      schools: {
        types: {
          name: 'string',
          paymentSettings: 'object'
        }
      },
      payments: {
        types: {
          schoolId: 'string',
          studentId: 'string',
          amount: 'number',
          currency: 'string',
          provider: 'string',
          transactionId: 'string',
          status: 'string',
          createdAt: 'date',
          updatedAt: 'date',
        }
      },
      sections: {
        types: {
          icon: 'string',
          borderColor: 'string',
          framePadding: 'string',
          gridGap: 'string',
          animationDuration: 'string',
          shrinkScale: 'string',
          slideDirection: 'string',
          skewAngle: 'string',
        }
      },
      ...config.schemas
    };
    this.authConfig = config.auth || { requireEmailVerification: true, otpTriggers: ["register"] };
    this.sessionStore = {};
    this.otpMemory = {};
    this.auditLog = {};
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `token ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  private async request(path: string, method: string = "GET", body: any = null, etag?: string): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}` +
                (method === "GET" ? `?ref=${this.branch}` : "");
    
    const headers = this.headers();
    if (etag) {
      headers["If-None-Match"] = etag;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 304) {
      return { notModified: true };
    }

    if (!res.ok) throw new Error(await res.text());
    
    if (res.status === 204 || res.status === 201) {
        return { success: true, ...await res.json() };
    }

    const json = await res.json();
    return { ...json, etag: res.headers.get("ETag") };
  }

  async get<T = any>(collection: string, force = false): Promise<T[]> {
    const cacheEntry = this.cache[collection];
    if (cacheEntry && !force) {
      return cacheEntry.data;
    }

    try {
      const res = await this.request(`${this.basePath}/${collection}.json`, "GET", null, cacheEntry?.etag);
      if (res.notModified) {
        return cacheEntry.data;
      }
      const data = JSON.parse(atob(res.content));
      this.cache[collection] = { data, etag: res.etag, sha: res.sha };
      this.notifySubscribers(collection, data);
      return data;
    } catch (e) {
      if ((e as Error).message.includes("Not Found")) {
        this.cache[collection] = { data: [], etag: undefined, sha: undefined };
        return [];
      }
      throw e;
    }
  }

  private notifySubscribers(collection: string, data: any[]) {
    (this.subscribers[collection] || []).forEach(cb => cb(data));
  }

  subscribe<T = any>(collection: string, callback: (data: T[]) => void): () => void {
    if (!this.subscribers[collection]) {
      this.subscribers[collection] = [];
    }
    this.subscribers[collection].push(callback);

    if (!this.pollingIntervals[collection]) {
      this.pollCollection(collection);
      const intervalId = setInterval(() => this.pollCollection(collection), 5000); // Poll every 5 seconds
      this.pollingIntervals[collection] = intervalId as any;
    }
    
    // Immediately provide current data
    if (this.cache[collection]) {
      callback(this.cache[collection].data);
    } else {
      this.get(collection).then(data => callback(data));
    }

    return () => this.unsubscribe(collection, callback);
  }

  unsubscribe(collection: string, callback: Function) {
    this.subscribers[collection] = (this.subscribers[collection] || []).filter(cb => cb !== callback);
    if (this.subscribers[collection].length === 0) {
      clearInterval(this.pollingIntervals[collection]);
      delete this.pollingIntervals[collection];
    }
  }

  private async pollCollection(collection: string) {
    try {
      const cacheEntry = this.cache[collection];
      const res = await this.request(`${this.basePath}/${collection}.json`, "GET", null, cacheEntry?.etag);

      if (!res.notModified) {
        const data = JSON.parse(atob(res.content));
        this.cache[collection] = { data, etag: res.etag, sha: res.sha };
        this.notifySubscribers(collection, data);
      }
    } catch (error) {
      console.error(`Polling failed for ${collection}:`, error);
    }
  }

  async getItem<T = any>(collection: string, key: string): Promise<T | null> {
    const arr = await this.get<T>(collection);
    return arr.find((x: any) => x.id === key || x.uid === key) || null;
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.writeQueue.length === 0) {
      return;
    }
    this.isProcessingQueue = true;
    const write = this.writeQueue[0];

    try {
      const { collection, data, resolve } = write;
      // Always fetch latest sha before writing
      const file = await this.request(`${this.basePath}/${collection}.json`).catch(() => ({ sha: undefined }));
      
      await this.request(`${this.basePath}/${collection}.json`, "PUT", {
          message: `Update ${collection} - ${new Date().toISOString()}`,
          content: btoa(JSON.stringify(data, null, 2)),
          branch: this.branch,
          sha: file.sha,
      });

      this.writeQueue.shift(); // Remove from queue on success
      this.get(collection, true); // Force-fetch latest data after successful write
      resolve(data);
    } catch (error: any) {
        if (error.message.includes("409") && write.retries < 5) { // Conflict
            write.retries++;
            // Don't remove from queue, will retry on next process tick
        } else {
            write.reject(error);
            this.writeQueue.shift(); // Remove from queue on hard failure
        }
    } finally {
        this.isProcessingQueue = false;
        // Immediately process next item
        if (this.writeQueue.length > 0) {
          setTimeout(() => this.processQueue(), 250);
        }
    }
  }

  private save<T = any>(collection: string, data: T[]): Promise<T[]> {
      return new Promise((resolve, reject) => {
        // Optimistic update
        this.cache[collection] = { ...this.cache[collection], data };
        this.notifySubscribers(collection, data);
        
        this.writeQueue.push({
            collection,
            data,
            resolve,
            reject,
            retries: 0
        });
        
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    });
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    const arr = await this.get<T>(collection);
    const schema = this.schemas[collection];
    if (schema?.defaults) item = { ...schema.defaults, ...item };
    this.validateSchema(collection, item);
    const id = (Math.max(0, ...arr.map((x: any) => +x.id || 0)) + 1).toString();
    const newItem = { uid: crypto.randomUUID(), id, ...item } as T & { id: string; uid: string };
    arr.push(newItem);
    await this.save(collection, arr);
    this._audit(collection, newItem, "insert");
    return newItem;
  }

  async bulkInsert<T = any>(collection: string, items: Partial<T>[]): Promise<(T & { id: string; uid: string })[]> {
    const arr = await this.get<T>(collection);
    const schema = this.schemas[collection];
    const base = Math.max(0, ...arr.map((x: any) => +x.id || 0));
    const newItems = items.map((item, i) => {
      if (schema?.defaults) item = { ...schema.defaults, ...item };
      this.validateSchema(collection, item);
      return { uid: crypto.randomUUID(), id: (base + i + 1).toString(), ...item } as T & { id: string; uid: string };
    });
    const result = [...arr, ...newItems];
    await this.save(collection, result);
    newItems.forEach(n => this._audit(collection, n, "insert"));
    return newItems;
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    await this.get(collection, true); // Ensure we have latest data
    const arr = [...(this.cache[collection]?.data || [])];
    
    const itemIndex = arr.findIndex((x: any) => x.id === key || x.uid === key);
    if (itemIndex === -1) {
      throw new Error(`Item with key "${key}" not found in collection "${collection}".`);
    }

    const updatedItem = { ...arr[itemIndex], ...updates };
    this.validateSchema(collection, updatedItem);
    arr[itemIndex] = updatedItem;

    await this.save(collection, arr);
    this._audit(collection, updatedItem, "update");
    return updatedItem;
  }

  async bulkUpdate<T = any>(collection: string, updates: (Partial<T> & { id?: string; uid?: string })[]): Promise<T[]> {
    const arr = await this.get<T>(collection);
    const updatedItems = updates.map(u => {
      const i = arr.findIndex((x: any) => x.id === u.id || x.uid === u.uid);
      if (i < 0) throw new Error(`Item not found: ${u.id || u.uid}`);
      const upd = { ...arr[i], ...u };
      this.validateSchema(collection, upd);
      arr[i] = upd;
      return upd;
    });
    await this.save(collection, arr);
    updatedItems.forEach(u => this._audit(collection, u, "update"));
    return updatedItems;
  }

  async delete<T = any>(collection: string, key: string): Promise<void> {
    const arr = await this.get<T>(collection);
    const filtered = arr.filter((x: any) => x.id !== key && x.uid !== key);
    const deleted = arr.filter((x: any) => x.id === key || x.uid === key);
    await this.save(collection, filtered);
    deleted.forEach(d => this._audit(collection, d, "delete"));
  }

  async bulkDelete<T = any>(collection: string, keys: string[]): Promise<T[]> {
    const arr = await this.get<T>(collection);
    const filtered = arr.filter((x: any) => !keys.includes(x.id) && !keys.includes(x.uid));
    const deleted = arr.filter((x: any) => keys.includes(x.id) || keys.includes(x.uid));
    await this.save(collection, filtered);
    deleted.forEach(d => this._audit(collection, d, "delete"));
    return deleted;
  }

  async cloneItem<T = any>(collection: string, key: string): Promise<T & { id: string; uid: string }> {
    const arr = await this.get<T>(collection);
    const orig = arr.find((x: any) => x.id === key || x.uid === key);
    if (!orig) throw new Error("Not found");
    const { id, uid, ...core } = orig as any;
    return this.insert(collection, core);
  }

  private validateSchema(collection: string, item: any): void {
    const schema = this.schemas[collection];
    if (!schema) return;
    (schema.required || []).forEach(r => {
      if (!(r in item)) throw new Error(`Missing required: ${r}`);
    });
    Object.entries(item).forEach(([k, v]) => {
      const t = schema.types?.[k];
      if (t) {
        const ok =
          (t === "string" && typeof v === "string") ||
          (t === "number" && typeof v === "number") ||
          (t === "boolean" && typeof v === "boolean") ||
          (t === "object" && typeof v === "object") ||
          (t === "array" && Array.isArray(v)) ||
          (t === "date" && !isNaN(Date.parse(v as string))) ||
          (t === "uuid" && typeof v === "string");
        if (!ok) throw new Error(`Field ${k} should be ${t}`);
      }
    });
  }

  validateAll<T = any>(collection: string, items: T[]): void {
    items.forEach(item => this.validateSchema(collection, item));
  }

  sanitize<T = any>(item: T, allowedFields: string[]): Partial<T> {
    const out: any = {};
    allowedFields.forEach(f => {
      if (f in (item as any)) out[f] = (item as any)[f];
    });
    return out;
  }

  setSchema(collection: string, schema: SchemaDefinition): void {
    this.schemas[collection] = schema;
  }

  getSchema(collection: string): SchemaDefinition | null {
    return this.schemas[collection] || null;
  }

  async collectionExists(collection: string): Promise<boolean> {
    const arr = await this.get(collection);
    return Array.isArray(arr);
  }

  async listCollections(): Promise<string[]> {
    try {
      const res = await this.request(this.basePath);
      return res.map((f: any) => f.name.replace(".json", ""));
    } catch {
      return [];
    }
  }

  async exportCollection(collection: string): Promise<string> {
    return JSON.stringify(await this.get(collection), null, 2);
  }

  async importCollection<T = any>(collection: string, json: string, overwrite: boolean = false): Promise<T[]> {
    const arr = JSON.parse(json);
    this.validateAll(collection, arr);
    const base = overwrite ? [] : await this.get(collection);
    const processed = arr.map((it: any, i: number) => ({ uid: crypto.randomUUID(), id: (i + 1).toString(), ...it }));
    await this.save(collection, [...base, ...processed]);
    processed.forEach((p: any) => this._audit(collection, p, "insert"));
    return processed;
  }

  async mergeCollections<T = any>(collection: string, json: string, overwrite: boolean = false): Promise<T[]> {
    const imported = await this.importCollection<T>(collection, json, overwrite);
    const existing = await this.get<T>(collection);
    const merged = overwrite ? imported : [...existing, ...imported];
    await this.save(collection, merged);
    return merged;
  }

  async backupCollection(collection: string): Promise<string> {
    const data = await this.exportCollection(collection);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${collection}-backup-${ts}.json`;
    await this.request(`${this.basePath}/backups/${filename}`, "PUT", {
      message: `Backup ${collection}`,
      content: btoa(data),
      branch: this.branch,
    });
    return filename;
  }

  async syncWithRemote<T = any>(collection: string): Promise<T[]> {
    return this.get<T>(collection);
  }

  queryBuilder<T = any>(collection: string): QueryBuilder<T> {
    let chain = Promise.resolve().then(() => this.get<T>(collection));
    const qb: QueryBuilder<T> = {
      where(fn: (item: T) => boolean) { 
        chain = chain.then(arr => arr.filter(fn)); 
        return qb; 
      },
      sort(field: string, dir: 'asc' | 'desc' = "asc") { 
        chain = chain.then(arr => arr.sort((a: any, b: any) => 
          dir === 'asc' ? (a[field] > b[field] ? 1 : -1) : (a[field] < b[field] ? 1 : -1)
        )); 
        return qb; 
      },
      project(fields: string[]) { 
        chain = chain.then(arr => arr.map((item: any) => { 
          const o: any = {}; 
          fields.forEach(f => { 
            if (f in item) o[f] = item[f]
          }); 
          return o 
        })); 
        return qb as QueryBuilder<any>; 
      },
      exec() { return chain; },
    };
    return qb;
  }

  async sendEmail(to: string, subject: string, html: string, smtpOverride: SMTPConfig | null = null): Promise<boolean> {
    const endpoint = smtpOverride?.endpoint || this.smtp.endpoint;
    const sender = smtpOverride?.from || this.smtp.from || "no-reply@example.com";
    const payload: EmailPayload = {
      to,
      subject,
      html,
      from: sender,
      headers: { "Reply-To": sender, "List-Unsubscribe": "<mailto:unsubscribe@example.com>" },
    };
    const res = await fetch(endpoint!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Email send failed");
    return true;
  }

  async sendOTP(email: string, reason: string = "verify"): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpMemory[email] = { otp, created: Date.now(), reason };
    const tpl = this.templates.otp?.replace("{{otp}}", otp) || `Your OTP is: ${otp}`;
    await this.sendEmail(email, `OTP for ${reason}`, tpl);
    return otp;
  }

  verifyOTP(email: string, otp: string): boolean {
    const rec = this.otpMemory[email];
    if (!rec || rec.otp !== otp) throw new Error("Invalid OTP");
    if (Date.now() - rec.created > 10 * 60 * 1000) throw new Error("OTP expired");
    delete this.otpMemory[email];
    return true;
  }

  validateEmailFormat(email: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  async testSMTPConnection(): Promise<boolean> {
    if (!this.smtp.test) throw new Error("SMTP test not available");
    return this.smtp.test();
  }

  hashPassword(password: string): string {
    const salt = crypto.randomUUID();
    const hash = btoa([...password + salt].map(c => c.charCodeAt(0).toString(16)).join(""));
    return `${salt}$${hash}`;
  }

  verifyPassword(password: string, hashString: string): boolean {
    const [salt, hash] = hashString.split("$");
    const testHash = btoa([...password + salt].map(c => c.charCodeAt(0).toString(16)).join(""));
    return testHash === hash;
  }

  async register(email: string, password: string, profile: Partial<User> = {}): Promise<User> {
    if (!this.validateEmailFormat(email)) throw new Error("Invalid email format");
    const users = await this.get<User>("users");
    if (users.find(u => u.email === email)) throw new Error("Email already registered");
    const hashed = this.hashPassword(password);
    const user = await this.insert<User>("users", { email, password: hashed, ...profile });
    if (this.authConfig.otpTriggers?.includes("register")) await this.sendOTP(email, "registration");
    return user;
  }

  async login(email: string, password: string): Promise<string | { otpRequired: boolean }> {
    const user = (await this.get<User>("users")).find(u => u.email === email);
    if (!user || !this.verifyPassword(password, user.password!)) throw new Error("Invalid credentials");
    if (this.authConfig.otpTriggers?.includes("login")) {
      await this.sendOTP(email, "login");
      return { otpRequired: true };
    }
    return this.createSession(user);
  }

  async verifyLoginOTP(email: string, otp: string): Promise<string> {
    this.verifyOTP(email, otp);
    const user = (await this.get<User>("users")).find(u => u.email === email);
    return this.createSession(user!);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = (await this.get<User>("users")).find(u => u.email === email);
    if (!user) throw new Error("Email not found");
    await this.sendOTP(email, "reset");
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    this.verifyOTP(email, otp);
    const users = await this.get<User>("users");
    const i = users.findIndex(u => u.email === email);
    if (i === -1) throw new Error("Email not found");
    users[i].password = this.hashPassword(newPassword);
    await this.save("users", users);
    return true;
  }

  async googleAuth(idToken: string): Promise<string> {
    const info = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    ).then((r) => r.json());

    if (!info.email || !info.sub) {
      throw new Error("Invalid Google ID token");
    }

    const users = await this.get<User>("users");
    let user = users.find((u) => u.email === info.email);

    if (user) {
      if (!user.googleId) {
        user.googleId = info.sub;
        await this.save("users", users);
      }
    } else {
      user = await this.insert<User>("users", {
        email: info.email,
        googleId: info.sub,
        verified: true,
      });
    }

    return this.createSession(user);
  }

  hasPermission(user: User | null, permission: string): boolean {
    return (user?.permissions || []).includes(permission);
  }

  async assignRole(userId: string, role: string): Promise<User> {
    const users = await this.get<User>("users");
    const user = users.find(u => u.id === userId || u.uid === userId);
    if (!user) throw new Error("User not found");
    user.roles = [...new Set([...(user.roles || []), role])];
    await this.save("users", users);
    return user;
  }

  async removeRole(userId: string, role: string): Promise<User> {
    const users = await this.get<User>("users");
    const user = users.find(u => u.id === userId || u.uid === userId);
    if (!user) throw new Error("User not found");
    user.roles = (user.roles || []).filter(r => r !== role);
    await this.save("users", users);
    return user;
  }

  getUserRoles(user: User | null): string[] {
    return user?.roles || [];
  }

  listPermissions(user: User | null): string[] {
    return user?.permissions || [];
  }

  createSession(user: User): string {
    const token = crypto.randomUUID();
    this.sessionStore[token] = { token, user, created: Date.now() };
    return token;
  }

  getSession(token: string): Session | null {
    return this.sessionStore[token] || null;
  }

  refreshSession(token: string): Session {
    const session = this.getSession(token);
    if (!session) throw new Error("Invalid session");
    session.created = Date.now();
    return session;
  }

  destroySession(token: string): boolean {
    delete this.sessionStore[token];
    return true;
  }

  getCurrentUser(token: string): User | null {
    const session = this.getSession(token);
    return session?.user || null;
  }

  renderTemplate(name: string, data: Record<string, any> = {}): string {
    let tpl = this.templates[name];
    if (!tpl) throw new Error(`Template not found: ${name}`);
    return tpl.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] ?? "");
  }

  prettyPrint(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  log(label: string, data: any): void {
    console.log(`[${label}]`, data);
  }

  getAuditLog(): Record<string, AuditLogEntry[]> {
    return this.auditLog;
  }

  resetAuditLog(): void {
    this.auditLog = {};
  }

  private _audit(collection: string, data: any, action: string): void {
    const logs = this.auditLog[collection] || [];
    logs.push({ action, data, timestamp: Date.now() });
    this.auditLog[collection] = logs.slice(-100);
  }

  status(): Record<string, any> {
    return {
      owner: this.owner,
      repo: this.repo,
      connected: !!this.token,
      collections: Object.keys(this.schemas),
      templates: Object.keys(this.templates),
      time: new Date().toISOString(),
    };
  }

  version(): string {
    return "1.0.0";
  }

  async diagnose(): Promise<Record<string, boolean>> {
    const checks = {
      githubAccess: !!(await this.listCollections().catch(() => false)),
      sessionStore: typeof this.sessionStore === "object",
      schemas: Object.keys(this.schemas).length > 0,
    };
    return checks;
  }

  throttle<T extends (...args: any[]) => any>(fn: T, wait: number = 1000): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let last = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        return fn(...args);
      }
    };
  }

  setConfig(key: keyof this, value: any): void {
    (this as any)[key] = value;
  }

  getConfig(key: keyof this): any {
    return (this as any)[key];
  }

  getSystemInfo(): Record<string, string> {
    return {
      platform: (globalThis as any).navigator?.platform || "server",
      userAgent: (globalThis as any).navigator?.userAgent || "node",
      sdkVersion: this.version(),
    };
  }

  catchErrors<T>(fn: () => T): T | null {
    try {
      return fn();
    } catch (e) {
      console.error("SDK Error:", e);
      return null;
    }
  }

  async uploadToCloudinary(file: File, folder: string = ""): Promise<CloudinaryUploadResult> {
    if (!this.cloudinary.uploadPreset || !this.cloudinary.cloudName) {
      throw new Error("Cloudinary configuration is incomplete.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.cloudinary.uploadPreset);
    if (folder) formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/upload`,
      { method: "POST", body: formData }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Upload failed.");
    return json;
  }

  async uploadMediaFile(file: File, folder: string = this.mediaPath): Promise<CloudinaryUploadResult> {
    return this.uploadToCloudinary(file, folder);
  }

  getMediaFile(publicId: string, options: string = ""): string {
    if (!this.cloudinary.cloudName) {
      throw new Error("Cloudinary cloudName not set.");
    }
    return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${options}/${publicId}`;
  }

  async deleteMediaFile(publicId: string, apiKey: string = this.cloudinary.apiKey!, apiSecret: string = this.cloudinary.apiSecret!): Promise<any> {
    if (!apiKey || !apiSecret || !this.cloudinary.cloudName) {
      throw new Error("Delete requires apiKey, apiSecret and cloudName (use from secure backend).");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const body = new URLSearchParams({
      public_id: publicId,
      api_key: apiKey,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/image/destroy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Delete failed.");
    return json;
  }

  async listMediaFiles(tag: string = "", max: number = 30): Promise<any[]> {
    if (!this.cloudinary.apiKey || !this.cloudinary.apiSecret || !this.cloudinary.cloudName) {
      throw new Error("List requires apiKey, apiSecret, and cloudName.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = tag ? `max_results=${max}&prefix=${tag}&timestamp=${timestamp}${this.cloudinary.apiSecret}`
                             : `max_results=${max}&timestamp=${timestamp}${this.cloudinary.apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const body = new URLSearchParams({
      max_results: max.toString(),
      ...(tag && { prefix: tag }),
      api_key: this.cloudinary.apiKey!,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/resources/image`,
      {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "List failed.");
    return json.resources;
  }

  async renameMediaFile(fromPublicId: string, toPublicId: string): Promise<any> {
    if (!this.cloudinary.apiKey || !this.cloudinary.apiSecret || !this.cloudinary.cloudName) {
      throw new Error("Rename requires apiKey, apiSecret, and cloudName.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `from_public_id=${fromPublicId}&to_public_id=${toPublicId}&timestamp=${timestamp}${this.cloudinary.apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const body = new URLSearchParams({
      from_public_id: fromPublicId,
      to_public_id: toPublicId,
      api_key: this.cloudinary.apiKey!,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/image/rename`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Rename failed.");
    return json;
  }

  async getMediaMetadata(publicId: string): Promise<any> {
    if (!this.cloudinary.apiKey || !this.cloudinary.apiSecret || !this.cloudinary.cloudName) {
      throw new Error("Metadata fetch requires apiKey, apiSecret, and cloudName.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${this.cloudinary.apiSecret}`;
    const signature = await this._sha1(stringToSign);

    const query = new URLSearchParams({
      public_id: publicId,
      api_key: this.cloudinary.apiKey!,
      timestamp: timestamp.toString(),
      signature,
    });

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/resources/image/upload/${publicId}?${query}`
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Metadata fetch failed.");
    return json;
  }

  transformMedia(publicId: string, options: string = "w_600,c_fill"): string {
    if (!this.cloudinary.cloudName) {
      throw new Error("Cloudinary cloudName is missing.");
    }
    return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${options}/${publicId}`;
  }

  async generateSignedURL(publicId: string, options: Record<string, any> = {}): Promise<never> {
    throw new Error("Signed URL generation must be done securely on backend.");
  }

  private async _sha1(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const buffer = await crypto.subtle.digest("SHA-1", data);
    return [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async init(): Promise<UniversalSDK> {
    await this.listCollections();
    return this;
  }

  destroyInstance(): void {
    Object.keys(this).forEach(k => delete (this as any)[k]);
  }

  reset(): void {
    this.sessionStore = {};
    this.otpMemory = {};
    this.auditLog = {};
  }

  isReady(): boolean {
    return !!(this.owner && this.repo && this.token);
  }

  async waitForReady(maxWait: number = 5000): Promise<boolean> {
    const start = Date.now();
    while (!this.isReady()) {
      if (Date.now() - start > maxWait) throw new Error("SDK not ready");
      await new Promise(res => setTimeout(res, 100));
    }
    return true;
  }
}

export default UniversalSDK;
export type { 
  UniversalSDKConfig, 
  CloudinaryConfig, 
  SMTPConfig, 
  AuthConfig, 
  SchemaDefinition, 
  User, 
  Session, 
  QueryBuilder,
  CloudinaryUploadResult,
  MediaAttachment
};
