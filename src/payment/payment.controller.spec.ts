import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis/redis.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

let redisService: RedisService;
let paymentService: PaymentService;
let paymentController: PaymentController;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: RedisService,
        useValue: {
          setHash: jest.fn(),
          getHash: jest.fn(),
          deleteHash: jest.fn(),
        },
      },
      {
        provide: PaymentService,
        useValue: {
          releasePayment: jest.fn(),
        },
      },
    ],
    controllers: [PaymentController],
  }).compile();

  redisService = module.get<RedisService>(RedisService);
  paymentService = module.get<PaymentService>(PaymentService);
  paymentController = module.get<PaymentController>(PaymentController);
});

describe('PaymentController', () => {
  it('Should be defined', () => expect(paymentController).toBeDefined());

  it('scheduleReleasePayment - Should log an error when process fails', async () => {
    const mockCallToSetHash = jest
      .spyOn(redisService, 'setHash')
      .mockImplementation(() => Promise.reject('dummy error'));
    const message = {
      scheduleExpression: '0 10 1 1 *',
      userType: 'Customer',
      serviceId: '63a729be3a5f5218366eab88',
    };

    await paymentController.scheduleReleasePayment(message);

    expect(mockCallToSetHash).toBeCalledTimes(1);
  });

  it('execReleasePayment - Should interrupt the process when there are no payments to release', async () => {
    const mockCallToGetHash = jest
      .spyOn(redisService, 'getHash')
      .mockImplementation(() => Promise.resolve({}));

    await paymentController.execReleasePayment();

    expect(mockCallToGetHash).toBeCalledTimes(1);
  });

  it('execReleasePayment - Should release payment when process succeeds', async () => {
    const mockCallToGetHash = jest
      .spyOn(redisService, 'getHash')
      .mockImplementation(() => Promise.resolve({
        key1: 'value1',
        key2: 'value2',
      }));
    const mockCallToReleasePayment = jest
      .spyOn(paymentService, 'releasePayment')
      .mockImplementation(() => Promise.resolve());
    const mockCallToDeleteHash = jest
      .spyOn(redisService, 'deleteHash')
      .mockImplementation(() => Promise.resolve());

    await paymentController.execReleasePayment();

    expect(mockCallToGetHash).toBeCalledTimes(1);
    expect(mockCallToReleasePayment).toBeCalledTimes(2);
    expect(mockCallToDeleteHash).toBeCalledTimes(1);
  });
});
