import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisClientType } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export interface RedisConfig {
  host: string;
  port: number;
}

@Injectable()
export class RedisService implements OnModuleInit {
  private logger = new Logger(RedisService.name);
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  async onModuleInit() {
    await this.redisClient.connect();
    this.logger.log('Redis client connected');
  }

  async getSerializableValue(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async setSerializableValue(key: string, value: string, duration?: number): Promise<void> {
    await this.redisClient.set(key, value, duration ? { EX: duration } : undefined);
  }
}
