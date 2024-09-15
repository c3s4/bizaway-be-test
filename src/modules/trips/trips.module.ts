import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './service/trips.service';
import { HttpModule } from '@nestjs/axios';
import { TripsRepository } from './persistance/repository/trips.repository';

@Module({
  imports: [HttpModule],
  controllers: [TripsController],
  providers: [TripsService, TripsRepository],
})
export class TripsModule {}
