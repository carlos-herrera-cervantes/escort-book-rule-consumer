import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { ServiceModule } from '../service/service.module';
import { PaymentDetail, PaymentDetailSchema } from './schemas/payment-detail.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentMethod, PaymentMethodSchema } from './schemas/payment-method.schema';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SlackMessenger',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'Rule Consumer',
            brokers: [process.env.KAFKA_BROKERS],
          },
          consumer: { groupId: process.env.KAFKA_GROUP_ID },
        },
      },
    ]),
    MongooseModule.forFeature([
      { name: PaymentDetail.name, schema: PaymentDetailSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    ServiceModule,
    HttpModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentRepository, PaymentService],
})
export class PaymentModule {}
