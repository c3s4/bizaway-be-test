import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SearchTripResponseDto, SearchTripsListResponseDto, SearchTripsRequestDto } from './dtos/search_trips.dto';
import { TripsService } from './service/trips.service';
import { SaveTripRequestDto, SaveTripResponseDto } from './dtos/save_trip.dto';
import { GetTripsListResponseDto, GetTripsRequestDto } from './dtos/get_trips.dto';
import { ApiOkResponsePaginated } from '../../common/dtos/paged_results.dto';

@Controller('trips')
export class TripsController {
  private logger = new Logger(TripsController.name);
  constructor(private tripService: TripsService) {}

  @Get('/search')
  @ApiOkResponsePaginated(SearchTripResponseDto)
  async searchTrips(@Query() searchParams: SearchTripsRequestDto): Promise<SearchTripsListResponseDto> {
    const foundTrips = await this.tripService.searchTripsFromIntegration(searchParams);
    if (foundTrips && searchParams.page && searchParams.page > 1 && foundTrips.totalPages < searchParams.page) {
      throw new BadRequestException('Page number is too high');
    }
    return foundTrips;
  }

  @Post('/')
  async saveTrip(@Body() saveTripRequest: SaveTripRequestDto): Promise<SaveTripResponseDto> {
    return await this.tripService.saveTrip(saveTripRequest);
  }

  @Get('/')
  @ApiOkResponsePaginated(SaveTripResponseDto)
  async getTrips(@Query() getTripsParams?: GetTripsRequestDto): Promise<GetTripsListResponseDto> {
    return await this.tripService.getTrips(getTripsParams);
  }

  @Get('/:id')
  async getTripById(@Param('id') id: string): Promise<SaveTripResponseDto> {
    return await this.tripService.getTripById(id);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteTripById(@Param('id') id: string) {
    await this.tripService.deleteTripById(id);
  }
}
