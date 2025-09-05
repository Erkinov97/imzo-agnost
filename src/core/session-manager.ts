/**
 * E-IMZO Session Manager
 * KeyId larni saqlash va avtomatik unload qilish uchun
 */

export type StorageType = 'sessionStorage' | 'localStorage' | 'cookie' | 'memory';

export interface SessionConfig {
  storageType: StorageType;
  autoUnloadAfter: number; // milliseconds, default 6 hours
  keyPrefix: string;
  cookieOptions?: {
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  };
}

export interface KeySession {
  keyId: string;
  certificateId: string;
  loadedAt: number;
  expiresAt: number;
  certificate: unknown;
  autoUnload: boolean;
}

export class EIMZOSessionManager {
  private config: SessionConfig;
  private sessions = new Map<string, KeySession>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      storageType: 'sessionStorage',
      autoUnloadAfter: 6 * 60 * 60 * 1000, // 6 hours default
      keyPrefix: 'eimzo_key_',
      ...config
    };

    this.initializeFromStorage();
    this.startCleanupTimer();
  }

  /**
   * KeyId ni session storage ga saqlash
   */
  saveKeySession(
    keyId: string,
    certificateId: string,
    certificate: unknown,
    autoUnload = true
  ): void {
    const now = Date.now();
    const session: KeySession = {
      keyId,
      certificateId,
      loadedAt: now,
      expiresAt: now + this.config.autoUnloadAfter,
      certificate,
      autoUnload
    };

    // Memory da saqlash
    this.sessions.set(certificateId, session);

    // Storage da saqlash
    this.saveToStorage(certificateId, session);

    console.log(
      `🔑 Key session saved: ${certificateId} (expires in ${this.config.autoUnloadAfter / 1000 / 60} minutes)`
    );
  }

  /**
   * Certificate ID bo'yicha keyId ni olish
   */
  getKeyId(certificateId: string): string | null {
    const session = this.sessions.get(certificateId);

    if (!session) {
      // Storage dan yuklashga harakat qilish
      this.loadFromStorage(certificateId);
      return this.sessions.get(certificateId)?.keyId ?? null;
    }

    // Expired bo'lsa null qaytarish
    if (Date.now() > session.expiresAt) {
      void this.removeKeySession(certificateId);
      return null;
    }

    return session.keyId;
  }

  /**
   * Barcha active key sessions ni olish
   */
  getActiveSessions(): KeySession[] {
    const now = Date.now();
    const activeSessions: KeySession[] = [];

    for (const [certId, session] of this.sessions.entries()) {
      if (now <= session.expiresAt) {
        activeSessions.push(session);
      } else {
        // Expired sessionlarni o'chirish
        void this.removeKeySession(certId);
      }
    }

    return activeSessions;
  }

  /**
   * Session ni kengaytirish (6 soat yana qo'shish)
   */
  extendSession(certificateId: string): boolean {
    const session = this.sessions.get(certificateId);
    if (!session) return false;

    const now = Date.now();
    session.expiresAt = now + this.config.autoUnloadAfter;

    void this.saveToStorage(certificateId, session);
    console.log(`⏰ Session extended for ${certificateId}`);
    return true;
  }

  /**
   * Key session ni o'chirish
   */
  async removeKeySession(certificateId: string): Promise<void> {
    const session = this.sessions.get(certificateId);

    if (session) {
      // E-IMZO dan keyni unload qilish
      if (session.autoUnload) {
        await this.unloadKeyFromEIMZO(session.keyId);
      }

      // Memory dan o'chirish
      this.sessions.delete(certificateId);

      // Storage dan o'chirish
      this.removeFromStorage(certificateId);

      console.log(`🗑️ Key session removed: ${certificateId}`);
    }
  }

  /**
   * Barcha sessionlarni tozalash
   */
  async clearAllSessions(): Promise<void> {
    const sessions = Array.from(this.sessions.keys());

    for (const certId of sessions) {
      await this.removeKeySession(certId);
    }

    console.log('🧹 All key sessions cleared');
  }

  /**
   * Storage configuration ni o'zgartirish
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Cleanup timer ni qayta ishga tushirish
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.startCleanupTimer();
  }

  // Private methods

  private saveToStorage(certificateId: string, session: KeySession): void {
    const key = this.config.keyPrefix + certificateId;
    const data = JSON.stringify(session);

    try {
      switch (this.config.storageType) {
        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(key, data);
          }
          break;

        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, data);
          }
          break;

        case 'cookie':
          this.setCookie(key, data, session.expiresAt);
          break;

        case 'memory':
          // Faqat memory da saqlash, hech narsa qilmaymiz
          break;
      }
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }

  private loadFromStorage(certificateId: string): KeySession | null {
    const key = this.config.keyPrefix + certificateId;

    try {
      let data: string | null = null;

      switch (this.config.storageType) {
        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            data = sessionStorage.getItem(key);
          }
          break;

        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            data = localStorage.getItem(key);
          }
          break;

        case 'cookie':
          data = this.getCookie(key);
          break;

        case 'memory':
          return null; // Memory da faqat current sessions bor
      }

      if (data) {
        const session = JSON.parse(data) as KeySession;

        // Expired bo'lsa o'chirish
        if (Date.now() > session.expiresAt) {
          this.removeFromStorage(certificateId);
          return null;
        }

        this.sessions.set(certificateId, session);
        return session;
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }

    return null;
  }

  private removeFromStorage(certificateId: string): void {
    const key = this.config.keyPrefix + certificateId;

    try {
      switch (this.config.storageType) {
        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem(key);
          }
          break;

        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
          }
          break;

        case 'cookie':
          this.deleteCookie(key);
          break;

        case 'memory':
          // Memory da hech narsa qilmaymiz
          break;
      }
    } catch (error) {
      console.warn('Failed to remove from storage:', error);
    }
  }

  private initializeFromStorage(): void {
    // Browser environment da barcha mavjud sessionlarni yuklash
    if (typeof window === 'undefined') return;

    try {
      const keys: string[] = [];

      switch (this.config.storageType) {
        case 'sessionStorage':
          if (typeof sessionStorage !== 'undefined') {
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key?.startsWith(this.config.keyPrefix)) {
                keys.push(key);
              }
            }
          }
          break;

        case 'localStorage':
          if (typeof localStorage !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key?.startsWith(this.config.keyPrefix)) {
                keys.push(key);
              }
            }
          }
          break;

        case 'cookie':
          // Cookie dan key'larni parsing qilish murakkab, skip qilamiz
          break;
      }

      // Key'larni yuklash
      keys.forEach(key => {
        const certificateId = key.replace(this.config.keyPrefix, '');
        this.loadFromStorage(certificateId);
      });
    } catch (error) {
      console.warn('Failed to initialize from storage:', error);
    }
  }

  private startCleanupTimer(): void {
    // Har 10 daqiqada expired sessionlarni tozalash
    this.cleanupInterval = setInterval(
      () => {
        void this.cleanupExpiredSessions();
      },
      10 * 60 * 1000
    );
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [certId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        expiredSessions.push(certId);
      }
    }

    for (const certId of expiredSessions) {
      await this.removeKeySession(certId);
    }

    if (expiredSessions.length > 0) {
      console.log(`🕒 Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  private async unloadKeyFromEIMZO(keyId: string): Promise<void> {
    try {
      // E-IMZO API dan to'g'ridan-to'g'ri unload qilish
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const windowWithCAPiWS = window as unknown as { CAPIWS?: any };

        if (windowWithCAPiWS.CAPIWS) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const CAPIWS = windowWithCAPiWS.CAPIWS;

          return new Promise<void>(resolve => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            CAPIWS.callFunction({
              plugin: 'pfx',
              name: 'unloadKey',
              arguments: [keyId],
              onSuccess: () => {
                console.log(`🔓 Key unloaded from E-IMZO: ${keyId}`);
                resolve();
              },
              onError: (error: unknown, reason: unknown) => {
                console.warn(`Failed to unload key ${keyId}:`, reason);
                resolve(); // Xatolik bo'lsa ham davom etish
              }
            });
          });
        }
      }
    } catch (error) {
      console.warn('Failed to unload key from E-IMZO:', error);
    }
  }

  // Cookie utility methods
  private setCookie(name: string, value: string, expiresAt: number): void {
    if (typeof document === 'undefined') return;

    const expires = new Date(expiresAt).toUTCString();
    const options = this.config.cookieOptions ?? {};

    let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires}`;

    if (options.domain) cookieString += `; domain=${options.domain}`;
    if (options.path) cookieString += `; path=${options.path}`;
    if (options.secure) cookieString += '; secure';
    if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;

    document.cookie = cookieString;
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;

    const options = this.config.cookieOptions ?? {};
    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;

    if (options.domain) cookieString += `; domain=${options.domain}`;
    if (options.path) cookieString += `; path=${options.path}`;

    document.cookie = cookieString;
  }

  /**
   * Cleanup when instance is destroyed
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Global session manager instance
export const sessionManager = new EIMZOSessionManager();
