import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const listenPort = configService.get('SERVER_PORT') || 3000;

  await app.listen(listenPort);
  console.log(`Application is listening to port: ${listenPort}`);
}
bootstrap();
