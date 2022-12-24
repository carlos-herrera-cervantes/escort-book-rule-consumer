import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Service } from './schemas/service.schema';
import { ServiceRepository } from './service.repository';

let serviceRepository: ServiceRepository;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ServiceRepository,
      {
        provide: getModelToken(Service.name),
        useValue: {},
      },
    ],
  }).compile();

  serviceRepository = module.get<ServiceRepository>(ServiceRepository);
});

describe('ServiceRepository', () => {
  it('Should be defined', () => expect(serviceRepository).toBeDefined());
});
