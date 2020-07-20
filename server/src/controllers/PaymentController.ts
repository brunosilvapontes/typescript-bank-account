import Account from '../schemas/Account'
import BusinessAccount from '../schemas/BusinessAccount'
import Payment from '../schemas/Payment'
import getInputValueError from '../common'
import mongoose from 'mongoose'

interface PaymentResponse {
  success: boolean,
  errorMessage?: string,
  status?: number
}

class PaymentController {
  public pay = async (value: number, accountId: string, businessAccountId: string, barcode: string): Promise<PaymentResponse> => {
    const errorMessage = getInputValueError(value)
    if (errorMessage) return { success: false, errorMessage, status: 400 }

    const alreadyPaid = await this.alreadyPaid(barcode)
    if (alreadyPaid) return { success: false, errorMessage: 'Conta já foi paga', status: 400 }

    const session = await Account.startSession()
    session.startTransaction()
    try {
      const opts = { session }
      const operations = []

      // Update payer account
      operations.push(
        Account.updateOne(
          { _id: accountId },
          {
            $push: {
              payments: {
                barcode,
                businessAccountId: mongoose.Types.ObjectId(businessAccountId),
                value
              }
            },
            $inc: { balance: value * -1 }
          },
          { setDefaultsOnInsert: true }
        )
      )

      // Update business account
      operations.push(
        BusinessAccount.updateOne(
          { _id: businessAccountId },
          {
            $push: {
              receivedPayments: {
                barcode,
                payerAccountId: mongoose.Types.ObjectId(accountId),
                value
              }
            },
            $inc: { balance: value }
          }
        )
      )

      // Register payment
      const payment = new Payment({
        barcode,
        value,
        businessAccountId: mongoose.Types.ObjectId(businessAccountId),
        payerAccountId: mongoose.Types.ObjectId(accountId)
      })
      operations.push(payment.save(opts))

      await Promise.all(operations)
      await session.commitTransaction()
      return { success: true }
    } catch (error) {
      await session.abortTransaction()
      return { success: false, errorMessage: error.message, status: 500 }
    } finally {
      session.endSession()
    }
  }

  private alreadyPaid = async (barcode: string): Promise<boolean> => {
    const payment = await Payment.find({ barcode })
    if (payment.length) return true
    return false
  }
}

export default new PaymentController()
