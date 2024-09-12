import { BadRequestException, Controller, Get, Logger, Query } from '@nestjs/common';
import { SearchTripsListResponseDto, SearchTripsRequestDto } from './dtos/search_trips.dto';
import { TripsService } from './service/trips.service';

@Controller('trips')
export class TripsController {
  private logger = new Logger(TripsController.name);
  constructor(private tripService: TripsService) {}

  @Get('/search')
  async searchTrips(@Query() searchParams: SearchTripsRequestDto): Promise<SearchTripsListResponseDto> {
    const foundTrips = await this.tripService.searchTripsFromIntegration(searchParams);
    if (foundTrips && searchParams.page && foundTrips.totalPages < searchParams.page) {
      throw new BadRequestException('Page number is too high');
    }
    return foundTrips;
  }
}
