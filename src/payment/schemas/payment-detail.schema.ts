import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { PaymentMethod } from './payment-method.schema';

export type PaymentDetailDocument = PaymentDetail & Document;

@Schema({ versionKey: false, collection: 'payment_detail' })
export class PaymentDetail {
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PaymentMethod' })
  paymentMethodId: PaymentMethod | Types.ObjectId;

  @Prop()
  serviceId: Types.ObjectId;

  @Prop()
  cardId: Types.ObjectId;

  @Prop()
  quantity: number;

  @Prop({ default: new Date().toUTCString() })
  createdAt: Date;

  @Prop({ default: new Date().toUTCString() })
  updateAt: Date;
}

export const PaymentDetailSchema = SchemaFactory.createForClass(PaymentDetail);
