import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SearchTripResponseDto, SearchTripsListResponseDto, SearchTripsRequestDto } from './dtos/search_trips.dto';
import { TripsService } from './service/trips.service';
import { SaveTripRequestDto, SaveTripResponseDto } from './dtos/save_trip.dto';
import { GetTripsListResponseDto, GetTripsRequestDto } from './dtos/get_trips.dto';
import { ApiOkResponsePaginated } from '../../common/dtos/paged_results.dto';
import { AccessTokenGuard } from '../auth/guards/access_token.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  private logger = new Logger(TripsController.name);
  constructor(private tripService: TripsService) {}

  @Get('/search')
  @ApiOkResponsePaginated(SearchTripResponseDto)
  async searchTrips(@Query() searchParams: SearchTripsRequestDto): Promise<SearchTripsListResponseDto> {
    return await this.tripService.searchTripsFromIntegration(searchParams);
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

  @ApiBearerAuth()
  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(AccessTokenGuard)
  async deleteTripById(@Param('id') id: string) {
    await this.tripService.deleteTripById(id);
  }
}
