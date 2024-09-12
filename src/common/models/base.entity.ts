import { Opt, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export abstract class BaseEntity {
  @PrimaryKey()
  _id: ObjectId;

  @SerializedPrimaryKey()
  id!: string; // won't be saved in the database

  @Property()
  createdAt: Opt<Date> = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Opt<Date> = new Date();
}
