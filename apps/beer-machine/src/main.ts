import { NestFactory } from '@nestjs/core';
import { BeerMachineModule } from './beer-machine.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(BeerMachineModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'beer_machine_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('Beer-machine microservice is listening to RabbitMQ');
}
bootstrap();
