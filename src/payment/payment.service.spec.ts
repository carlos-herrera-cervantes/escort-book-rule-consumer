import { ClientKafka } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Observable } from 'rxjs';
import { Service, ServiceDocument } from '../service/schemas/service.schema';
import { ServiceRepository } from '../service/service.repository';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';
import { Payment } from './schemas/payment.schema';

let paymentRepository: PaymentRepository;
let serviceRepository: ServiceRepository;
let kafkaClient: ClientKafka;
let paymentService: PaymentService;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      PaymentService,
      {
        provide: PaymentRepository,
        useValue: {
          create: jest.fn(),
        },
      },
      {
        provide: ServiceRepository,
        useValue: {
          populateOne: jest.fn(),
        },
      },
      {
        provide: 'SlackMessenger',
        useValue: {
          emit: jest.fn(),
        },
      },
    ],
  }).compile();

  paymentRepository = module.get<PaymentRepository>(PaymentRepository);
  serviceRepository = module.get<ServiceRepository>(ServiceRepository);
  kafkaClient = module.get<ClientKafka>('SlackMessenger');
  paymentService = module.get<PaymentService>(PaymentService);
});

describe('PaymentService', () => {
  it('Should be defined', () => expect(paymentService).toBeDefined());

  it('releasePayment - Should interrupt the process when service is invalid', async () => {
    const mockCallToGetOneAndPopulate = jest
      .spyOn(serviceRepository, 'populateOne')
      .mockImplementation(() => Promise.resolve(null));

    await paymentService.releasePayment("63a743ba1acc1c2fa36c8e52", "Customer");

    expect(mockCallToGetOneAndPopulate).toBeCalledTimes(1);
  });

  it(
    'releasePayment - Should interrupt the process when service does not have a card payment method',
    async () => {
      const serviceDocument = new Service() as ServiceDocument;
      serviceDocument.status = 'started';
      serviceDocument.paymentDetails = [];

      const mockCallToGetOneAndPopulate = jest
        .spyOn(serviceRepository, 'populateOne')
        .mockImplementation(() => Promise.resolve(serviceDocument));

      await paymentService.releasePayment("63a743ba1acc1c2fa36c8e52", "Customer");

      expect(mockCallToGetOneAndPopulate).toBeCalledTimes(1);
    });

    it('releasePayment - Should complete the process for customer user', async () => {
      const serviceDocument = new Service() as ServiceDocument;
      serviceDocument.status = 'started';
      serviceDocument.paymentDetails = [
        {
          _id: '63a7479d2a938309de257c6f',
          cardId: new Types.ObjectId(),
          paymentMethodId: new Types.ObjectId(),
          serviceId: new Types.ObjectId(),
          quantity: 800,
          createdAt: new Date(),
          updateAt: new Date(),
        },
      ];

      const mockCallToGetOneAndPopulate = jest
        .spyOn(serviceRepository, 'populateOne')
        .mockImplementation(() => Promise.resolve(serviceDocument));
      const mockCallToEmit = jest
        .spyOn(kafkaClient, 'emit')
        .mockImplementation(() => new Observable<any>());

      await paymentService.releasePayment("63a743ba1acc1c2fa36c8e52", "Customer");

      expect(mockCallToGetOneAndPopulate).toBeCalledTimes(1);
      expect(mockCallToEmit).toBeCalledTimes(1);
    });

    it('releasePayment - Should complete the process for escort user', async () => {
      const serviceDocument = new Service() as ServiceDocument;
      serviceDocument.save = jest.fn().mockImplementation(() => Promise.resolve());
      serviceDocument.status = 'started';
      serviceDocument.paymentDetails = [
        {
          _id: '63a7479d2a938309de257c6f',
          cardId: new Types.ObjectId(),
          paymentMethodId: new Types.ObjectId(),
          serviceId: new Types.ObjectId(),
          quantity: 800,
          createdAt: new Date(),
          updateAt: new Date(),
        },
      ];

      const mockCallToGetOneAndPopulate = jest
        .spyOn(serviceRepository, 'populateOne')
        .mockImplementation(() => Promise.resolve(serviceDocument));
      const mockCallToCreate = jest
        .spyOn(paymentRepository, 'create')
        .mockImplementation(() => Promise.resolve(new Payment()));
      const mockCallToEmit = jest
        .spyOn(kafkaClient, 'emit')
        .mockImplementation(() => new Observable<any>());

      await paymentService.releasePayment("63a743ba1acc1c2fa36c8e52", "Escort");

      expect(mockCallToGetOneAndPopulate).toBeCalledTimes(1);
      expect(mockCallToCreate).toBeCalledTimes(1);
      expect(serviceDocument.save).toBeCalledTimes(1);
      expect(mockCallToEmit).toBeCalledTimes(1);
    });
});
