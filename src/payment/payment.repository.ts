import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePayment } from './dto/payment.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentRepository {
  @InjectModel(Payment.name)
  private readonly paymentModel: Model<PaymentDocument>;

  async create(payment: CreatePayment): Promise<Payment> {
    return this.paymentModel.create(payment);
  }
}
