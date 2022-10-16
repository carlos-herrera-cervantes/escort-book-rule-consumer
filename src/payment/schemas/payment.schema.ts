import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ versionKey: false, collection: 'payments' })
export class Payment {
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  escortId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  customerId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  serviceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  cardId: Types.ObjectId;

  @Prop()
  logRequest: string;

  @Prop()
  logResponse: string;

  @Prop({ default: new Date().toUTCString() })
  createdAt: Date;

  @Prop({ default: new Date().toUTCString() })
  updateAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
