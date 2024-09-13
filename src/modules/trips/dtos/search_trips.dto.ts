import { IsEnum, IsOptional } from 'class-validator';
import { PagedRequestDto, PagedResponseDto } from '../../../common/dtos/paged_results.dto';
import { Expose } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export enum SortBy {
  CHEAPEST = 'cheapest',
  FASTEST = 'fastest',
}

export enum PlaceCode {
  ATL = 'ATL',
  PEK = 'PEK',
  LAX = 'LAX',
  DXB = 'DXB',
  HND = 'HND',
  ORD = 'ORD',
  LHR = 'LHR',
  PVG = 'PVG',
  CDG = 'CDG',
  DFW = 'DFW',
  AMS = 'AMS',
  FRA = 'FRA',
  IST = 'IST',
  CAN = 'CAN',
  JFK = 'JFK',
  SIN = 'SIN',
  DEN = 'DEN',
  ICN = 'ICN',
  BKK = 'BKK',
  SFO = 'SFO',
  LAS = 'LAS',
  CLT = 'CLT',
  MIA = 'MIA',
  KUL = 'KUL',
  SEA = 'SEA',
  MUC = 'MUC',
  EWR = 'EWR',
  MAD = 'MAD',
  HKG = 'HKG',
  MCO = 'MCO',
  PHX = 'PHX',
  IAH = 'IAH',
  SYD = 'SYD',
  MEL = 'MEL',
  GRU = 'GRU',
  YYZ = 'YYZ',
  LGW = 'LGW',
  BCN = 'BCN',
  MAN = 'MAN',
  BOM = 'BOM',
  DEL = 'DEL',
  ZRH = 'ZRH',
  SVO = 'SVO',
  DME = 'DME',
  JNB = 'JNB',
  ARN = 'ARN',
  OSL = 'OSL',
  CPH = 'CPH',
  HEL = 'HEL',
  VIE = 'VIE',
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
}

export class SearchTripIntegrationResponseDto {
  origin: string;
  destination: string;
  cost: number;
  duration: number;
  type: string;
  id: string;
  display_name: string;
}

export class SearchTripResponseDto {
  origin: string;
  destination: string;
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
