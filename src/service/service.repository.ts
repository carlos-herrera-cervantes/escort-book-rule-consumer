import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { ServiceDocument, Service } from './schemas/service.schema';

@Injectable()
export class ServiceRepository {
  @InjectModel(Service.name)
  private readonly serviceModel: Model<ServiceDocument>;

  async getOneAndPopulate(
    filter?: FilterQuery<Service>,
    ...poulateFilter: any
  ): Promise<ServiceDocument> {
    const query = this.serviceModel.findOne(filter);
    poulateFilter.forEach((innerFilter) => query.populate(innerFilter));
    return query;
  }
}
