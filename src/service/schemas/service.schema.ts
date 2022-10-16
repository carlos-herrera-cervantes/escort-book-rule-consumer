import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { PaymentDetail } from '../../payment/schemas/payment-detail.schema';

export type ServiceDocument = Service & Document;

@Schema({ versionKey: false, collection: 'services' })
export class Service {
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  customerId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  escortId: Types.ObjectId;

  @Prop()
  price: number;

  @Prop()
  businessCommission: number;

  @Prop()
  status: string;

  @Prop()
  timeQuantity: number;

  @Prop()
  timeMeasurementUnit: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'PaymentDetail' }],
  })
  paymentDetails: PaymentDetail[] | Types.ObjectId[];

  @Prop()
  partialPayment: boolean;

  @Prop({ default: new Date().toUTCString() })
  createdAt: Date;

  @Prop({ default: new Date().toUTCString() })
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
