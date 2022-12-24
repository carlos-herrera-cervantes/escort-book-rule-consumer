import { Types } from 'mongoose';

export class CreatePayment {
  escortId: Types.ObjectId;
  customerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  cardId?: Types.ObjectId;
  logRequest?: string;
  logResponse?: string;
}
