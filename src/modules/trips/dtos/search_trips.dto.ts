import { IsEnum, IsOptional } from 'class-validator';
import { PagedRequestDto, PagedResponseDto } from '../../../common/dtos/paged_results.dto';
import { Expose } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { PlaceCode, TripType } from '../../../common/dtos/trip.enum';

export enum SortBy {
  CHEAPEST = 'cheapest',
  FASTEST = 'fastest',
}

export class SearchTripsRequestDto extends PartialType(PagedRequestDto) {
  @IsEnum(PlaceCode)
  origin: PlaceCode;

  @IsEnum(PlaceCode)
  destination: PlaceCode;

  @IsOptional()
  @IsEnum(SortBy, { message: 'Invalid sort_by value, must be one of [cheapest, fastest]' })
  @Expose({ name: 'sort_by' })
  sortBy?: SortBy;

  @IsOptional()
  @IsEnum(TripType)
  @Expose({ name: 'trip_type' })
  tripType?: TripType;
}

export class SearchTripIntegrationResponseDto {
  origin: PlaceCode;
  destination: PlaceCode;
  cost: number;
  duration: number;
  type: string;
  id: string;
  display_name: string;
}

export class SearchTripResponseDto {
  origin: PlaceCode;
  destination: PlaceCode;
  cost: number;
  duration: number;
  type: string;
  @Expose({ name: 'display_name' })
  displayName: string;
  @Expose({ name: 'remote_id' })
  remoteId: string;

  constructor(trip: SearchTripResponseDto) {
    this.origin = trip.origin;
    this.destination = trip.destination;
    this.cost = trip.cost;
    this.duration = trip.duration;
    this.type = trip.type;
    this.remoteId = trip.remoteId;
    this.displayName = trip.displayName;
  }
}

export class SearchTripsListResponseDto extends PagedResponseDto<SearchTripResponseDto> {}
