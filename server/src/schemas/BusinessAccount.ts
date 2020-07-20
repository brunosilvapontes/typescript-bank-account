import { Schema, model, Document } from 'mongoose'

interface ReceivedPaymentsInterface {
  payerAccountId: Schema.Types.ObjectId,
  value: number,
  barcode: string,
  timestamp?: Date
}

interface BusinessAccountInterface extends Document {
  receivedPayments?: Array<ReceivedPaymentsInterface>,
  balance?: number
}

const BusinessAccountSchema = new Schema({
  receivedPayments: [{
    payerAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    value: Number,
    barcode: String,
    timestamp: { type: Date, default: Date.now }
  }],
  balance: { type: Number, Default: 0 }
}, {
  timestamps: true
})

export default model<BusinessAccountInterface>('BusinessAccount', BusinessAccountSchema)
