import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentMethodDocument = PaymentMethod & Document;

@Schema({ versionKey: false, collection: 'payment_methods' })
export class PaymentMethod {
  _id: string;

  @Prop({ unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: new Date().toUTCString() })
  createdAt: Date;

  @Prop({ default: new Date().toUTCString() })
  updateAt: Date;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
