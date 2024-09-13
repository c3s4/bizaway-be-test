import { EntityManager } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import { Trip } from '../entites/trip.entity';
import { SaveTripRequestDto } from '../../dtos/save_trip.dto';

@Injectable()
export class TripsRepository {
  constructor(private em: EntityManager) {}

  async createTrip(newTrip: SaveTripRequestDto): Promise<Trip> {
    const trip = new Trip(newTrip);
    await this.em.persistAndFlush(trip);
    return trip;
  }
}
