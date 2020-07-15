import { Schema, model, Document } from 'mongoose'

interface CashMoveInterface {
    timestamp: Date,
    value: number
}

interface PaymentInfoInterface extends CashMoveInterface {
    idPayment: { type: Schema.Types.ObjectId, ref: 'Payment' }
}

interface AccountInterface extends Document {
  balance: number,
  payments?: Array<PaymentInfoInterface>,
  withdrawals?: Array<CashMoveInterface>,
  deposits?: Array<CashMoveInterface>
}

const AccountSchema = new Schema({
  balance: { type: Number, Default: 0 },
  payments: [{
    idPayment: { type: Schema.Types.ObjectId, ref: 'Payment' },
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
