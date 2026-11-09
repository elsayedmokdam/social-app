import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config";

export class CacheService {
  private readonly client: RedisClientType;
  constructor() {
    this.client = createClient({ url: REDIS_URI });
    this.connect();
  }

  // Redis Connection
  async connect() {
    try {
      await this.client.connect();
      console.log("Redis Connected Successfully ✅");
    } catch (error) {
      console.log(`Failed to Connect Redis ❌ ${error}`);
    }
  }

  // Redis Methods
  async set({
    key,
    value,
    ttl = undefined,
  }: {
    key: string;
    value: any;
    ttl?: number;
  }) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    return await this.client.set(key, value, { ...(ttl ? { EX: ttl } : {}) });
  }

  async get({ key }: { key: string }) {
    let value = await this.client.get(key);
    try {
      return JSON.parse(value as string);
    } catch (error) {
      return value;
    }
  }

  async exists({ key }: { key: string }) {
    return await this.client.exists(key);
  }

  async update({
    key,
    value,
    ttl = undefined,
  }: {
    key: string;
    value: any;
    ttl?: number;
  }) {
    if (!(await this.exists({ key }))) return 0;
    await this.client.set(key, value, { ...(ttl ? { EX: ttl } : {}) });
  }

  async del({ key }: { key: string | string[] }) {
    return key.length && (await this.client.del(key));
  }

  // Get all keys with a specific prefix
  async keys({ prefix }: { prefix: string }) {
    return await this.client.keys(`${prefix}*`);
  }

  // Get the time-to-live (TTL) of a key in seconds
  async ttl({ key }: { key: string }) {
    return await this.client.ttl(key);
  }

  // Set the time-to-live (TTL) of a key in seconds
  async expire({ key, ttl }: { key: string; ttl: number }) {
    return await this.client.expire(key, ttl);
  }

  async incrBy({ key, value = 1 }: { key: string; value?: number }) {
    return await this.client.incrBy(key, value);
  }
}

export const cacheService = new CacheService();
