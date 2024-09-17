import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig, validateEnv } from '../../../src/common/configs/environment';
import { configureApp } from '../../../src/init';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { dbConfig } from '../../../src/common/configs/mikro_orm.config';
import { MikroORM } from '@mikro-orm/mongodb';
import { AuthModule } from '../../../src/modules/auth/auth.module';
import { User } from '../../../src/modules/users/persistance/entities/user.entity';
import { HashingService } from '../../../src/modules/auth/service/hashing.service';
import { UsersRepository } from '../../../src/modules/users/persistance/repository/users.repository';
import { JwtModule } from '@nestjs/jwt';

describe('[Feature] Auth - /auth', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let hashingService: HashingService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [envConfig],
          envFilePath: '.env.test.local',
          expandVariables: true,
          validate: validateEnv,
          isGlobal: true,
        }),
        MikroOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              envFilePath: '.env.test.local',
              expandVariables: true,
            }),
          ],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            ...dbConfig(configService, true),
            entities: ['./dist/**/user.entity*.js'],
            entitiesTs: ['./src/**/user.entity*.ts'],
          }),
        }),
        JwtModule.registerAsync({
          global: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return {
              secret: configService.get('jwt.secret'),
              signOptions: {
                expiresIn: configService.get('jwt.accessTokenTtl'),
                issuer: configService.get('jwt.issuer'),
                audience: configService.get('jwt.audience'),
              },
            };
          },
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    orm = app.get<MikroORM>(MikroORM);
    configureApp(app);

    await app.init();
    await orm.schema.refreshDatabase();

    hashingService = moduleFixture.get<HashingService>(HashingService);
    usersRepository = moduleFixture.get<UsersRepository>(UsersRepository);
  });

  describe('POST /login', () => {
    it('should allow a user to login', async () => {
      const newUser = new User({ email: 'email@test.com', password: await hashingService.hash('fake-password') });
      await orm.em.persistAndFlush(newUser);

      const response = await request(app.getHttpServer()).post('/api/auth/login').send({
        email: 'email@test.com',
        password: 'fake-password',
      });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should return a BadRequestException', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'wrong',
          password: 'wrong',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'wrong',
          password: 'password ok but email wrong',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'email@test.com',
          password: 'ko',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer()).post('/api/auth/login').send({}).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return an UnauthorizedException', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'fake-email@test.com',
          password: 'fake-password',
        })
        .expect(401);
    });
  });

  describe('POST /register', () => {
    it('should register a user', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'email@test.com',
        password: 'fake-password',
      });

      expect(response.status).toBe(201);
      expect(response.body.email).toEqual('email@test.com');
      expect(response.body.id).toBeDefined();
    });

    it('should return a BadRequestException', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'wrong',
          password: 'wrong',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'wrong',
          password: 'password ok but email wrong',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'email@test.com',
          password: 'ko',
        })
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer()).post('/api/auth/register').send({}).expect(HttpStatus.BAD_REQUEST);
    });

    it('should return a ConflictException', async () => {
      const newUser = new User({ email: 'email@test.com', password: await hashingService.hash('fake-password') });
      await orm.em.persistAndFlush(newUser);

      const response = await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'email@test.com',
        password: 'fake-password',
      });

      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return an InternalServerErrorException', async () => {
      usersRepository.createUser = jest.fn().mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'email@test.com',
        password: 'fake-password',
      });

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  afterEach(async () => {
    await orm.schema.refreshDatabase();
    await app.close();
  });
});
