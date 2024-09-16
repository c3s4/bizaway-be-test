import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { RedisClientType } from 'redis';

describe('RedisService', () => {
  let service: RedisService;
  let redisClient: RedisClientType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            connect: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue('value'),
            set: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisClient = module.get<RedisClientType>('REDIS_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get value from redis', async () => {
    const value = await service.getSerializableValue('key');
    expect(value).toBe('value');
  });

  it('should get null from redis', async () => {
    redisClient.get = jest.fn().mockResolvedValue(null);
    const value = await service.getSerializableValue('fake-key');
    expect(value).toBe(null);
  });

  it('should set value in redis', async () => {
    await service.setSerializableValue('key', 'value');
    expect(redisClient.set).toHaveBeenCalledWith('key', 'value', undefined);
  });

  it('should set value in redis with expiration', async () => {
    await service.setSerializableValue('key', 'value', 60);
    expect(redisClient.set).toHaveBeenCalledWith('key', 'value', { EX: 60 });
  });
});
