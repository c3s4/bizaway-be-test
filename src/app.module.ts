import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripsModule } from './modules/trips/trips.module';
import { envConfig, validateEnv } from './common/configs/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      expandVariables: true,
      validate: validateEnv,
    }),
    TripsModule,
  ],
})
export class AppModule {}
