import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './redis.module_definition';
import { RedisService } from './service/redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule extends ConfigurableModuleClass {}
