import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { AppModule } from './app.module';
import { KafkaClient } from './config/kafka.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: { brokers: [KafkaClient.Brokers] },
      consumer: { groupId: KafkaClient.GroupId },
    }
  });
  await app.listen();
}
bootstrap();
