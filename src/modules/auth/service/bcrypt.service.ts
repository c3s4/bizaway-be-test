import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService extends HashingService {
  async hash(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(plain, salt);
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}
