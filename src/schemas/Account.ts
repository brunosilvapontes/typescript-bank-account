import { Schema, model, Document } from 'mongoose'

interface CashMoveInterface {
    timestamp: Date,
    value: number
}

interface PaymentInterface extends CashMoveInterface {
    serviceResponse: string
}

interface AccountInterface extends Document {
  balance: number,
  payments?: Array<PaymentInterface>,
  withdrawals?: Array<CashMoveInterface>,
  deposits?: Array<CashMoveInterface>
}

const AccountSchema = new Schema({
  balance: { type: Number, Default: 0 },
  payments: [{
    serviceResponse: { type: String },
    timestamp: { type: Date },
    value: { type: Number }
  }],
  withdrawals: [{
    timestamp: { type: Date },
    value: { type: Number }
  }],
  deposits: [{
    timestamp: { type: Date },
    value: { type: Number }
  }]
}, {
  timestamps: true
})

export default model<AccountInterface>('Account', AccountSchema)
