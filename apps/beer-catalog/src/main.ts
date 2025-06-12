import { NestFactory } from '@nestjs/core';
import { BeerCatalogModule } from './beer-catalog.module';

async function bootstrap() {
  const app = await NestFactory.create(BeerCatalogModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
