import { NestFactory } from '@nestjs/core';
import { BeerCatalogModule } from './beer-catalog.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(BeerCatalogModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'beer_catalog_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('Beer-catalog microservice is listening to RabbitMQ');
}
bootstrap();
