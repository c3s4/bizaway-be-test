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

  async getTrips(page: number, itemsPerPage: number): Promise<{ trips: Trip[]; totalTrips: number }> {
    const offset = (page - 1) * itemsPerPage;

    const [foundTrips, totalTripsCount] = await this.em.findAndCount(Trip, {}, { limit: itemsPerPage, offset });

    return {
      trips: foundTrips,
      totalTrips: totalTripsCount,
    };
  }
}
