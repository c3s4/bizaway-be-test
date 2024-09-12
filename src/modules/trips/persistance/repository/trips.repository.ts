import { EntityManager } from '@mikro-orm/mongodb';
import { Injectable } from '@nestjs/common';
import { Trip } from '../entites/trip.entity';

@Injectable()
export class TripsRepository {
  constructor(private em: EntityManager) {}

  async createTrip() {
    const trip = new Trip();
    await this.em.persistAndFlush(trip);
    return trip;
  }
}
