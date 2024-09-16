import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TripsModule } from './modules/trips/trips.module';
import { envConfig, validateEnv } from './common/configs/environment';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { dbConfig } from './common/configs/mikro_orm.config';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      expandVariables: true,
      validate: validateEnv,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => dbConfig(configService),
    }),
    TripsModule,
    RedisModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        };
      },
    }),
  ],
})
export class AppModule {}
