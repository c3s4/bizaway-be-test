import { Injectable, Logger } from '@nestjs/common';
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
import { PagedRequestDto } from '../../../common/dtos/paged_results.dto';
import { PAGINATION } from '../../../common/configs/constants';

@Injectable()
export class TripsService {
  private logger = new Logger(TripsService.name);
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async searchTripsFromIntegration(
    searchParams: SearchTripsRequestDto,
    paginationParams: PagedRequestDto = {
      page: PAGINATION.DEFAULT_PAGE,
      itemsPerPage: PAGINATION.DEFAULT_ITEMS_PER_PAGE,
    },
  ): Promise<SearchTripsListResponseDto> {
    const response = await lastValueFrom(
      this.httpService
        .get<SearchTripIntegrationResponseDto[]>(
          `${this.configService.get('plannerApi.url')}?origin=${searchParams.origin}&destination=${searchParams.destination}`,
          {
            headers: {
              'x-api-key': this.configService.get('plannerApi.key'),
            },
          },
        )
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

    if (searchParams.sort_by) {
      remappedResponse.sort((a, b) => {
        if (searchParams.sort_by === SortBy.CHEAPEST) {
          return a.cost - b.cost;
        } else if (searchParams.sort_by === SortBy.FASTEST) {
          return a.duration - b.duration;
        }
      });
    }

    const startingIndex = (paginationParams.page - 1) * paginationParams.itemsPerPage;
    const endingIndex = startingIndex + paginationParams.itemsPerPage;

    return {
      items: remappedResponse.slice(startingIndex, endingIndex),
      currentPage: paginationParams.page,
      totalPages: Math.ceil(remappedResponse.length / paginationParams.itemsPerPage),
      totalItems: remappedResponse.length,
      itemsPerPage: paginationParams.itemsPerPage,
    };
  }
}
