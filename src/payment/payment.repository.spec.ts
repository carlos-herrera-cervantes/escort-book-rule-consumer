import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from './payment.repository';
import { Payment } from './schemas/payment.schema';

let paymentRepository: PaymentRepository;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      PaymentRepository,
      {
        provide: getModelToken(Payment.name),
        useValue: {},
      },
    ],
  }).compile();

  paymentRepository = module.get<PaymentRepository>(PaymentRepository);
});

describe('PaymentRepository', () => {
  it('Should be defined', () => expect(paymentRepository).toBeDefined());
});
