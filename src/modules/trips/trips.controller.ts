import { BadRequestException, Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { SearchTripsListResponseDto, SearchTripsRequestDto } from './dtos/search_trips.dto';
import { TripsService } from './service/trips.service';
import { SaveTripRequestDto, SaveTripResponseDto } from './dtos/save_trip.dto';
import { GetTripsListResponseDto, GetTripsRequestDto } from './dtos/get_trips.dto';

@Controller('trips')
export class TripsController {
  private logger = new Logger(TripsController.name);
  constructor(private tripService: TripsService) {}

  @Post('/')
  async saveTrip(@Body() saveTripRequest: SaveTripRequestDto): Promise<SaveTripResponseDto> {
    return await this.tripService.saveTrip(saveTripRequest);
  }

  @Get('/')
  async getTrips(@Query() getTripsParams?: GetTripsRequestDto): Promise<GetTripsListResponseDto> {
    return await this.tripService.getTrips(getTripsParams);
  }

  @Get('/search')
  async searchTrips(@Query() searchParams: SearchTripsRequestDto): Promise<SearchTripsListResponseDto> {
    const foundTrips = await this.tripService.searchTripsFromIntegration(searchParams);
    if (foundTrips && searchParams.page && searchParams.page > 1 && foundTrips.totalPages < searchParams.page) {
      throw new BadRequestException('Page number is too high');
    }
    return foundTrips;
  }
}
