import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  SearchTripIntegrationResponseDto,
  SearchTripResponseDto,
  SearchTripsListResponseDto,
  SearchTripsRequestDto,
  SortBy,
} from '../dtos/search_trips.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { PAGINATION } from '../../../common/configs/constants';
import { SaveTripRequestDto, SaveTripResponseDto } from '../dtos/save_trip.dto';
import { TripsRepository } from '../persistance/repository/trips.repository';
import { GetTripsListResponseDto, GetTripsRequestDto } from '../dtos/get_trips.dto';
import { RedisService } from '../../redis/service/redis.service';

@Injectable()
export class TripsService {
  private logger = new Logger(TripsService.name);
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private tripsRepository: TripsRepository,
    private redisService: RedisService,
  ) {}

  async searchTripsFromIntegration(searchParams: SearchTripsRequestDto): Promise<SearchTripsListResponseDto> {
    const {
      origin,
      destination,
      itemsPerPage = PAGINATION.DEFAULT_ITEMS_PER_PAGE,
      page = PAGINATION.DEFAULT_PAGE,
      sortBy,
      tripType,
    } = searchParams;

    let tripsList: SearchTripIntegrationResponseDto[];

    const cacheKey = `${origin}-${destination}`;
    let cachedTrips: string | null = null;

    try {
      cachedTrips = await this.redisService.getSerializableValue(cacheKey);
    } catch (error) {
      this.logger.error(error);
    }

    if (cachedTrips) {
      tripsList = JSON.parse(cachedTrips);
    } else {
      const response = await lastValueFrom(
        this.httpService
          .get<SearchTripIntegrationResponseDto[]>(
            `${this.configService.get('plannerApi.url')}?origin=${origin}&destination=${destination}`,
            {
              headers: {
                'x-api-key': this.configService.get('plannerApi.key'),
              },
            },
          )
          .pipe(
            catchError((error: any) => {
              this.logger.error(error);
              throw new InternalServerErrorException('Error connecting to external API');
            }),
          ),
      );
      this.logger.log(`Successfully fetched trips from external API. Trips count: ${response.data.length}`);

      tripsList = response.data;

      try {
        await this.redisService.setSerializableValue(
          cacheKey,
          JSON.stringify(tripsList),
          this.configService.get('redis.cacheDuration') || undefined,
        );
      } catch (error) {
        this.logger.error(error);
      }
    }

    let remappedResponse = tripsList.map<SearchTripResponseDto>((trip) => {
      const singleTrip = new SearchTripResponseDto({
        origin: trip.origin,
        destination: trip.destination,
        cost: trip.cost,
        duration: trip.duration,
        type: trip.type,
        remoteId: trip.id,
        displayName: trip.display_name,
      });

      return singleTrip;
    });

    if (tripType) {
      remappedResponse = remappedResponse.filter((trip) => trip.type === tripType);
    }

    if (sortBy) {
      remappedResponse.sort((a, b) => {
        if (sortBy === SortBy.CHEAPEST) {
          return a.cost - b.cost;
        } else if (sortBy === SortBy.FASTEST) {
          return a.duration - b.duration;
        }
      });
    }

    const startingIndex = (page - 1) * itemsPerPage;
    const endingIndex = startingIndex + itemsPerPage;

    return new SearchTripsListResponseDto({
      items: remappedResponse.slice(startingIndex, endingIndex),
      currentPage: page,
      totalPages: Math.ceil(remappedResponse.length / itemsPerPage),
      totalItems: remappedResponse.length,
      itemsPerPage: itemsPerPage,
    });
  }

  async saveTrip(trip: SaveTripRequestDto): Promise<SaveTripResponseDto> {
    const savedTrip = await this.tripsRepository.createTrip(trip);
    return new SaveTripResponseDto(savedTrip);
  }

  async getTrips(getTripsParams?: GetTripsRequestDto): Promise<GetTripsListResponseDto> {
    const { page = PAGINATION.DEFAULT_PAGE, itemsPerPage = PAGINATION.DEFAULT_ITEMS_PER_PAGE } = getTripsParams || {};

    const trips = await this.tripsRepository.getTrips(page, itemsPerPage);
    return new GetTripsListResponseDto({
      items: trips.trips.map((trip) => new SaveTripResponseDto(trip)),
      currentPage: page,
      totalPages: Math.ceil(trips.totalTrips / itemsPerPage),
      totalItems: trips.totalTrips,
      itemsPerPage: itemsPerPage,
    });
  }

  async deleteTripById(tripId: string): Promise<void> {
    await this.tripsRepository.deleteTripById(tripId);
  }

  async getTripById(tripId: string): Promise<SaveTripResponseDto> {
    const trip = await this.tripsRepository.getTripById(tripId);
    return new SaveTripResponseDto(trip);
  }
}
