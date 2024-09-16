import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface RedisConfig {
  host?: string;
  port?: number;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: REDIS_OPTIONS } =
  new ConfigurableModuleBuilder<RedisConfig>()
    .setExtras<{ isGlobal?: boolean }>(
      {
        isGlobal: false,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();
