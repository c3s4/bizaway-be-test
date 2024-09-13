import { PagedRequestDto, PagedResponseDto } from '../../../common/dtos/paged_results.dto';
import { SaveTripResponseDto } from './save_trip.dto';

export class GetTripsRequestDto extends PagedRequestDto {}

export class GetTripsListResponseDto extends PagedResponseDto<SaveTripResponseDto> {}
