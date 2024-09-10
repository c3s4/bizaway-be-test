import { Controller, Get } from '@nestjs/common';

@Controller('trips')
export class TripsController {
  constructor() {}

  @Get()
  getAllTrips() {
    return 'All trips';
  }
}
