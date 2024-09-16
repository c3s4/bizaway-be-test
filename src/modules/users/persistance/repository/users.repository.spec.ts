import { MikroORM, NotFoundError } from '@mikro-orm/mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConfig } from '../../../../common/configs/mikro_orm.config';
import { envConfig, validateEnv } from '../../../../common/configs/environment';
import { UsersRepository } from './users.repository';
import { User } from '../entities/user.entity';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let orm: MikroORM;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              load: [envConfig],
              envFilePath: '.env.test.local',
              expandVariables: true,
              validate: validateEnv,
            }),
          ],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => dbConfig(configService, true),
        }),
      ],
      providers: [UsersRepository],
    }).compile();

    orm = app.get<MikroORM>(MikroORM);
    usersRepository = app.get<UsersRepository>(UsersRepository);

    await orm.schema.refreshDatabase();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const user = await usersRepository.createUser({
        email: 'email@test.com',
        password: 'fake-password',
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();

      const allUsers = await orm.em.findAll('User');
      expect(allUsers.length).toBe(1);
      expect(allUsers[0]).toEqual(user);
    });

    it('should throw an error if the email is already taken', async () => {
      const user = new User({ email: 'email@test.com', password: 'fake-password' });
      await orm.em.persistAndFlush(user);

      const pendingPromise = usersRepository.createUser({
        email: 'email@test.com',
        password: 'fake-password',
      });

      expect(pendingPromise).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('should get a user by id', async () => {
      const user = new User({ email: 'email@test.com', password: 'fake-password' });
      await orm.em.persistAndFlush(user);

      const foundUser = await usersRepository.getUserById(user.id);
      expect(foundUser).toEqual(user);
    });
    it('should throw if user not found', async () => {
      let pendingPromise = usersRepository.getUserById('fake-id');
      expect(pendingPromise).rejects.toThrow();

      const user = new User({ email: 'email@test.com', password: 'fake-password' });
      await orm.em.persistAndFlush(user);

      pendingPromise = usersRepository.getUserById('fake-id');
      expect(pendingPromise).rejects.toThrow();
    });
  });

  afterEach(async () => {
    await orm.schema.refreshDatabase();
    app.close();
  });
});
