import { Schema, model, Document } from 'mongoose'

interface PaymentInterface extends Document {
  payingAccount: Schema.Types.ObjectId,
  serviceResponseId: string,
  value: number,
  serviceEndpoint: string
}

const PaymentSchema = new Schema({
  payingAccount: { type: Schema.Types.ObjectId, ref: 'Account' },
  serviceResponseId: String,
  value: Number,
  serviceEndpoint: String
}, {
  timestamps: true
})

export default model<PaymentInterface>('Payment', PaymentSchema)
