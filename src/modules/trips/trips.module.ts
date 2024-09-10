import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './service/trips.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
