import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingService {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hashed: string): Promise<boolean>;
}
