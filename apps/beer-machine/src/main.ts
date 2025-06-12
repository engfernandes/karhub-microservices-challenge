import { NestFactory } from '@nestjs/core';
import { BeerMachineModule } from './beer-machine.module';

async function bootstrap() {
  const app = await NestFactory.create(BeerMachineModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
