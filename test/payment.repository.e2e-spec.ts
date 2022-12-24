import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentModule } from '../src/payment/payment.module';
import { MongoClient } from '../src/config/mongo.config';
import { PaymentRepository } from '../src/payment/payment.repository';
import { CreatePayment } from '../src/payment/dto/payment.dto';
import { RedisModule } from '../src/redis/redis.module';

let app: INestApplication;
let paymentRepository: PaymentRepository;

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(MongoClient.Uri),
      RedisModule,
      PaymentModule,
    ],
  }).compile();

  app = module.createNestApplication();
  await app.init();

  paymentRepository = module.get<PaymentRepository>(PaymentRepository);
});

afterAll(async () => await app.close());

describe('PaymentRepository', () => {
  it('create - Should add a new document', async () => {
    const payment = new CreatePayment();
    payment.escortId = new Types.ObjectId();
    payment.customerId = new Types.ObjectId();
    payment.serviceId = new Types.ObjectId();

    const createdResult = await paymentRepository.create(payment);

    expect(createdResult._id).not.toBeNull();
  });
});
