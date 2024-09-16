import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { REDIS_OPTIONS, RedisConfig } from '../redis.module_definition';

// export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private logger = new Logger(RedisService.name);
  private redisClient: RedisClientType;
  constructor(@Inject(REDIS_OPTIONS) private readonly redisOptions: RedisConfig) {
    this.redisClient = createClient({
      url: `redis://@${this.redisOptions.host}:${this.redisOptions.port}`,
    });
    this.redisClient.on('error', (err) => this.logger.error('Redis Client Error', err));
    this.redisClient.connect().then(() => this.logger.log('Redis client connected'));
  }

  async onApplicationShutdown() {
    await this.redisClient.disconnect();
    this.logger.log('Redis client disconnected');
  }

  async getSerializableValue(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async setSerializableValue(key: string, value: string, duration?: number): Promise<void> {
    await this.redisClient.set(key, value, duration ? { EX: duration } : undefined);
  }
}
