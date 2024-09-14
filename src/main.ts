import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureApp } from './init';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const listenPort = configService.get('serverPort');

  configureApp(app);

  await app.listen(listenPort);
  console.log(`Application started...`);
}
bootstrap();
