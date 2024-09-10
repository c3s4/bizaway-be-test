import { Injectable, Logger } from '@nestjs/common';
import {
  SearchTripIntegrationResponseDto,
  SearchTripResponseDto,
  SearchTripsListResponseDto,
  SearchTripsRequestDto,
} from '../dtos/search_trips.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TripsService {
  private logger = new Logger(TripsService.name);
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async searchTripsFromIntegration(searchParams: SearchTripsRequestDto): Promise<SearchTripsListResponseDto> {
    const response = await lastValueFrom(
      this.httpService
        .get<
          SearchTripIntegrationResponseDto[]
        >(`${this.configService.get('plannerApi.url')}?origin=${searchParams.origin}&destination=${searchParams.destination}`)
        .pipe(
          catchError((error: any) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    const remappedResponse = response.data.map<SearchTripResponseDto>((trip) => {
      return {
        origin: trip.origin,
        destination: trip.destination,
        cost: trip.cost,
        duration: trip.duration,
        type: trip.type,
        remoteId: trip.id,
        display_name: trip.display_name,
      };
    });

    return {
      items: remappedResponse,
      currentPage: 1,
      totalPages: 1,
      totalItems: remappedResponse.length,
      itemsPerPage: remappedResponse.length,
    };
  }
}
