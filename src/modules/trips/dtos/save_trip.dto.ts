import { Expose } from 'class-transformer';
import { IsEnum, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';
import { PlaceCode, TripType } from '../../../common/dtos/trip.enum';

export class SaveTripRequestDto {
  @IsEnum(PlaceCode)
  origin: PlaceCode;
  @IsEnum(PlaceCode)
  destination: PlaceCode;
  @IsPositive()
  cost: number;
  @IsPositive()
  duration: number;
  @IsEnum(TripType)
  type: TripType;
  @Expose({ name: 'remote_id' })
  @IsUUID('all', { message: 'remote_id must be a UUID' })
  remoteId: string;
  @Expose({ name: 'display_name' })
  @MinLength(1, { message: 'display_name must be a string' })
  displayName: string;
}

export class SaveTripResponseDto {
  id: string;
  origin: PlaceCode;
  destination: PlaceCode;
  cost: number;
  duration: number;
  type: TripType;
  @Expose({ name: 'remote_id' })
  remoteId: string;
  @Expose({ name: 'display_name' })
  displayName: string;

  constructor(trip: SaveTripResponseDto) {
    this.id = trip.id;
    this.origin = trip.origin;
    this.destination = trip.destination;
    this.cost = trip.cost;
    this.duration = trip.duration;
    this.type = trip.type;
    this.remoteId = trip.remoteId;
    this.displayName = trip.displayName;
  }
}
