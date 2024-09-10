import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripsModule } from './modules/trips/trips.module';
import { envConfig } from './common/configs/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      expandVariables: true,
    }),
    TripsModule,
  ],
})
export class AppModule {}
