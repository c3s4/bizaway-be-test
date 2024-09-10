import { PagedResults } from '../../../common/dtos/paged_results';

export type SortBy = 'fastest' | 'cheapest';
export type PlaceCode =
  | 'ATL'
  | 'PEK'
  | 'LAX'
  | 'DXB'
  | 'HND'
  | 'ORD'
  | 'LHR'
  | 'PVG'
  | 'CDG'
  | 'DFW'
  | 'AMS'
  | 'FRA'
  | 'IST'
  | 'CAN'
  | 'JFK'
  | 'SIN'
  | 'DEN'
  | 'ICN'
  | 'BKK'
  | 'SFO'
  | 'LAS'
  | 'CLT'
  | 'MIA'
  | 'KUL'
  | 'SEA'
  | 'MUC'
  | 'EWR'
  | 'MAD'
  | 'HKG'
  | 'MCO'
  | 'PHX'
  | 'IAH'
  | 'SYD'
  | 'MEL'
  | 'GRU'
  | 'YYZ'
  | 'LGW'
  | 'BCN'
  | 'MAN'
  | 'BOM'
  | 'DEL'
  | 'ZRH'
  | 'SVO'
  | 'DME'
  | 'JNB'
  | 'ARN'
  | 'OSL'
  | 'CPH'
  | 'HEL'
  | 'VIE';

export class SearchTripsRequestDto {
  origin: PlaceCode;
  destination: PlaceCode;
  sort_by?: SortBy;
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
  display_name: string;
  remoteId: string;
}

export class SearchTripsListResponseDto extends PagedResults<SearchTripResponseDto> {}
