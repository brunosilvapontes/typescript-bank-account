import { Schema, model, Document } from 'mongoose'

interface CashMoveInterface {
  timestamp?: Date,
  value: number
}

interface PaymentInfoInterface extends CashMoveInterface {
  barcode: string,
  businessAccountId: Schema.Types.ObjectId
}

interface AccountInterface extends Document {
  balance: number,
  payments?: Array<PaymentInfoInterface>,
  withdrawals?: Array<CashMoveInterface>,
  deposits?: Array<CashMoveInterface>
}

const AccountSchema = new Schema({
  balance: { type: Number, default: 0 },
  payments: [{
    barcode: { type: String },
    timestamp: { type: Date, default: Date.now },
    businessAccountId: { type: Schema.Types.ObjectId, ref: 'BusinessAccount' },
    value: { type: Number }
  }],
  withdrawals: [{
    timestamp: { type: Date, default: Date.now },
    value: { type: Number }
  }],
  deposits: [{
    timestamp: { type: Date, default: Date.now },
    value: { type: Number }
  }]
}, {
  timestamps: true
})

export default model<AccountInterface>('Account', AccountSchema)
