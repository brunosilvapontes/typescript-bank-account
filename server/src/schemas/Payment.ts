import { Schema, model, Document } from 'mongoose'

interface PaymentInterface extends Document {
  barcode: string,
  value: number,
  payerAccountId: Schema.Types.ObjectId,
  businessAccountId: Schema.Types.ObjectId
}

const PaymentSchema = new Schema({
  barcode: { type: String },
  value: { type: Number },
  payerAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
  businessAccountId: { type: Schema.Types.ObjectId, ref: 'BusinessAccount' }
}, {
  timestamps: true
})

export default model<PaymentInterface>('Payment', PaymentSchema)
