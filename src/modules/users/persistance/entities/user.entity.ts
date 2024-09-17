import { BaseEntity } from '../../../../common/models/base.entity';
import { Entity, Property } from '@mikro-orm/core';

@Entity()
export class User extends BaseEntity {
  @Property({ unique: true })
  email: string;

  @Property({ hidden: true })
  password: string;

  constructor({ email, password }: { email: string; password: string }) {
    super();
    this.email = email;
    this.password = password;
  }
}
