import { DynamicModule, Logger, Module } from '@nestjs/common';
import { REDIS_CLIENT, RedisConfig, RedisService } from './service/redis.service';
import { createClient } from 'redis';
import { logger } from '@mikro-orm/nestjs';

@Module({})
export class RedisModule {
  private logger = new Logger(RedisModule.name);
  static register(options: RedisConfig): DynamicModule {
    const { host = 'localhost', port = 6379 } = options;
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_CLIENT,
          useFactory: () => {
            const client = createClient({
              url: `redis://@${host}:${port}`,
            });
            client.on('error', (err) => logger.error('Redis Client Error', err));
            return client;
          },
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}
