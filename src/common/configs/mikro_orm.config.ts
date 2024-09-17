import { defineConfig } from '@mikro-orm/mongodb';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ConfigService } from '@nestjs/config';

export const dbConfig = (configService: ConfigService, isTestingEnv?: boolean) =>
  defineConfig({
    allowGlobalContext: !!isTestingEnv,
    entities: ['./dist/**/*.entity*.js'],
    entitiesTs: ['./src/**/*.entity*.ts'],
    clientUrl: configService.get('database.url'),
    debug: false,
    metadataProvider: TsMorphMetadataProvider,
    ensureIndexes: true,
    metadataCache: {
      options: {
        cacheDir: '.mikro_orm_metadata',
      },
    },
  });
