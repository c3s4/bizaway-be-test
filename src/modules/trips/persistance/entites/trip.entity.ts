import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../../common/models/base.entity';
import { PlaceCode, TripType } from '../../../../common/dtos/trip.enum';

@Entity()
export class Trip extends BaseEntity {
  @Property()
  origin: PlaceCode;
  @Property()
  destination: PlaceCode;
  @Property()
  cost: number;
  @Property()
  duration: number;
  @Property()
  type: TripType;
  @Property()
  remoteId: string;
  @Property()
  displayName: string;

  constructor(trip: Omit<Trip, keyof BaseEntity>) {
    super();
    this.origin = trip.origin;
    this.destination = trip.destination;
    this.cost = trip.cost;
    this.duration = trip.duration;
    this.type = trip.type;
    this.remoteId = trip.remoteId;
    this.displayName = trip.displayName;
  }
}
