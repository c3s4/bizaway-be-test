import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { REDIS_OPTIONS } from '../redis.module_definition';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig, validateEnv } from '../../../common/configs/environment';
import { createClient, RedisClientType } from 'redis';

describe('RedisService', () => {
  let module: TestingModule;
  let service: RedisService;
  let redisDirectClient: RedisClientType;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [envConfig],
          envFilePath: '.env.test.local',
          expandVariables: true,
          validate: validateEnv,
        }),
      ],
      providers: [
        RedisService,
        {
          inject: [ConfigService],
          provide: REDIS_OPTIONS,
          useFactory: (configService: ConfigService) => {
            return {
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
            };
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    const configService = module.get<ConfigService>(ConfigService);
    redisDirectClient = createClient({
      url: `redis://@${configService.get('redis.host')}:${configService.get('redis.port')}`,
    });
    await redisDirectClient.connect();
    await redisDirectClient.flushAll();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get value from redis', async () => {
    await redisDirectClient.set('key', 'value');
    const value = await service.getSerializableValue('key');
    expect(value).toBe('value');
  });

  it('should get null from redis', async () => {
    const value = await service.getSerializableValue('fake-key');
    expect(value).toBe(null);
  });

  it('should set value in redis', async () => {
    await service.setSerializableValue('key', 'value');

    const value = await redisDirectClient.get('key');
    expect(value).toBe('value');
  });

  it('should set value in redis with expiration', async () => {
    await service.setSerializableValue('key', 'value', 1);
    const value = await redisDirectClient.get('key');
    expect(value).toBe('value');

    const expirationPromise = () =>
      new Promise((resolve) => {
        setTimeout(async () => {
          const value = await redisDirectClient.get('key');
          resolve(value);
        }, 2000);
      });

    const result = await expirationPromise();
    expect(result).toBe(null);
  });

  afterEach(async () => {
    await redisDirectClient.flushAll();
    await redisDirectClient.disconnect();
    module.close();
  });
});
