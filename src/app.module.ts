import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TripsModule } from './modules/trips/trips.module';
import { envConfig, validateEnv } from './common/configs/environment';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { dbConfig } from './common/configs/mikro_orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      expandVariables: true,
      validate: validateEnv,
    }),
    MikroOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          expandVariables: true,
        }),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => dbConfig(configService),
    }),
    TripsModule,
  ],
})
export class AppModule {}
