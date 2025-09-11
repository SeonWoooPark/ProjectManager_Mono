/**
 * Redis Cache Client
 * 
 * Redis를 사용한 캐싱 클라이언트
 * 향후 확장을 위한 기본 구조 제공
 */

interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
  flushall(): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * 메모리 기반 캐시 (개발용)
 * 실제 운영에서는 Redis를 사용해야 함
 */
export class InMemoryCache implements CacheClient {
  private cache = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + (ttl * 1000) : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async expire(key: string, ttl: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expiresAt = Date.now() + (ttl * 1000);
      this.cache.set(key, item);
    }
  }

  async flushall(): Promise<void> {
    this.cache.clear();
  }

  async disconnect(): Promise<void> {
    this.cache.clear();
  }

  // 만료된 키들을 정리하는 메서드
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 실제 Redis 클라이언트 (향후 구현)
 * 
 * 사용 예시:
 * ```typescript
 * export class RedisCache implements CacheClient {
 *   private client: RedisClientType;
 *   
 *   constructor() {
 *     this.client = createClient({
 *       host: process.env.REDIS_HOST || 'localhost',
 *       port: parseInt(process.env.REDIS_PORT || '6379'),
 *     });
 *   }
 *   
 *   async get(key: string): Promise<string | null> {
 *     return await this.client.get(key);
 *   }
 *   
 *   // ... 기타 메서드들
 * }
 * ```
 */

// Cache 인스턴스 싱글톤
let cacheInstance: CacheClient | null = null;

export const getCacheClient = (): CacheClient => {
  if (!cacheInstance) {
    // 실제 운영에서는 Redis를 사용
    // const isProduction = process.env.NODE_ENV === 'production';
    // cacheInstance = isProduction ? new RedisCache() : new InMemoryCache();
    cacheInstance = new InMemoryCache();
  }
  return cacheInstance;
};

// Cache 헬퍼 함수들
export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const client = getCacheClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const client = getCacheClient();
    await client.set(key, JSON.stringify(value), ttl);
  },

  async del(key: string): Promise<void> {
    const client = getCacheClient();
    await client.del(key);
  },

  async exists(key: string): Promise<boolean> {
    const client = getCacheClient();
    return await client.exists(key);
  },

  async expire(key: string, ttl: number): Promise<void> {
    const client = getCacheClient();
    await client.expire(key, ttl);
  },

  async flushall(): Promise<void> {
    const client = getCacheClient();
    await client.flushall();
  },

  async disconnect(): Promise<void> {
    const client = getCacheClient();
    await client.disconnect();
  }
};