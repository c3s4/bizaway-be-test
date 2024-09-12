import { Entity } from '@mikro-orm/core';
import { BaseEntity } from '../../../../common/models/base.entity';

@Entity()
export class Trip extends BaseEntity {
  constructor() {
    super();
  }
}
