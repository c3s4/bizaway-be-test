import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TripsModule } from './modules/trips/trips.module';
import { envConfig, validateEnv } from './common/configs/environment';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { dbConfig } from './common/configs/mikro_orm.config';
import { RedisModule } from './modules/redis/redis.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('jwt.secret'),
          signOptions: {
            expiresIn: configService.get('jwt.accessTokenTtl'),
            issuer: configService.get('jwt.issuer'),
            audience: configService.get('jwt.audience'),
          },
        };
      },
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
