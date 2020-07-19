import { Request, Response } from 'express'
import Account from '../schemas/Account'
import { Tedis } from 'tedis'
import * as dotenv from 'dotenv'
import getInputValueError from '../common'
import BusinessAccount from '../schemas/BusinessAccount'
import PaymentController from './PaymentController'

// Load environment variables
dotenv.config()

// This solution uses predefined accounts
const ACCOUNT_ID = '5f0d26f2b027fd046c594ab1'
const BUSINESS_ACCOUNT_ID = '5f11222cdb8f314f3d2e6efb'
const BLOCKING_MSG = 'Sua conta tem um pagamento em andamento, tente novamente'

const PAYMENT_LOCK = 'PAYMENT_LOCK'
const redis = new Tedis({
  port: 13657,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
})

class AccountController {
  public getHistoric = async (req: Request, res: Response): Promise<Response> => {
    try {
      const account = await Account.findById(ACCOUNT_ID)
      if (!account) {
        const message = 'Conta não encontrada'
        return res.status(404).json({ message })
      }

      // Get all transactions and label them as "ENTRADA" or "SAÍDA"
      const historic = { balance: account.balance, transactions: [] }
      account.payments.forEach(payment => {
        historic.transactions.push({
          type: 'SAÍDA',
          timestamp: payment.timestamp,
          value: payment.value
        })
      })
      account.deposits.forEach(deposit => {
        historic.transactions.push({
          type: 'ENTRADA',
          timestamp: deposit.timestamp,
          value: deposit.value
        })
      })
      account.withdrawals.forEach(withdrawal => {
        historic.transactions.push({
          type: 'SAÍDA',
          timestamp: withdrawal.timestamp,
          value: withdrawal.value
        })
      })

      // Sort the transactions
      historic.transactions.sort((t1, t2) => t1.timestamp - t2.timestamp)

      return res.json(historic)
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }

  public payment = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Check if a payment is blocking withdrawals
      const isBlocked = await this.isAccountBlocked()
      if (isBlocked) return res.status(409).json({ message: BLOCKING_MSG })

      // Check if accounts exists
      let message = ''
      const operationAccounts = await Promise.all([
        Account.findById(ACCOUNT_ID),
        BusinessAccount.findById(BUSINESS_ACCOUNT_ID)
      ])
      if (!operationAccounts[0] || !operationAccounts[1]) {
        message = 'Conta(s) não encontrada(s)'
        return res.status(404).json({ message })
      }

      // Check query string input
      const value = Number(req.query.value)
      const barcode = String(req.query.barcode)
      if (!value || !barcode) {
        message = 'Valor e/ou código de barras não foi passado'
        return res.status(400).json({ message })
      }

      // Check if there is enough balance
      if (operationAccounts[0].balance < value) {
        message = 'Saldo não é suficiente para realizar o pagamento'
        return res.status(400).json({ message })
      }

      // Block withdrawing money from the account
      await redis.setex(PAYMENT_LOCK, 10, 'blocked')

      const paid = await PaymentController.pay(value, ACCOUNT_ID, BUSINESS_ACCOUNT_ID, barcode)
      if (paid.success) return res.sendStatus(200)
      return res.status(paid.status).json({ message: paid.errorMessage })
    } catch (error) {
      return res.status(500).json({ message: error.message })
    } finally {
      redis.del(PAYMENT_LOCK)
    }
  }

  public deposit = async (req: Request, res: Response): Promise<Response> => {
    try {
      let message = ''
      const account = await Account.findById(ACCOUNT_ID)
      if (!account) {
        message = 'Conta não encontrada'
        return res.status(404).json({ message })
      }

      const value = Number(req.query.value)
      message = getInputValueError(value)
      if (message) return res.status(400).json({ message })

      // Append a new deposit and update balance
      await Account.updateOne(
        { _id: ACCOUNT_ID },
        {
          $push: { deposits: { value } },
          $inc: { balance: value }
        }
      )
      return res.sendStatus(200)
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }

  private isAccountBlocked = async (): Promise<boolean> => {
    // Check if a payment or a withdrawal is blocking account movements
    let paymentBlock = await redis.get(PAYMENT_LOCK)
    if (paymentBlock) {
      // Try again after a few seconds
      await new Promise(resolve => setTimeout(resolve, 3000))
      paymentBlock = await redis.get(PAYMENT_LOCK)
      if (paymentBlock) return true
    }
    return false
  }

  public withdraw = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Check if a payment or another withdrawal is blocking withdrawals
      const isBlocked = await this.isAccountBlocked()
      if (isBlocked) return res.status(409).json({ message: BLOCKING_MSG })

      let message = ''
      const value = Number(req.query.value)
      message = getInputValueError(value)
      if (message) return res.status(400).json({ message })

      // Check if there is enough balance
      const account = await Account.findById(ACCOUNT_ID, 'balance')
      if (!account) {
        message = 'Conta não encontrada'
        return res.status(404).json({ message })
      }
      if (account.balance < value) {
        message = 'Saldo não é suficiente para realizar o resgate'
        return res.status(400).json({ message })
      }

      // Block withdrawing money from the account
      await redis.setex(PAYMENT_LOCK, 10, 'blocked')

      // Append a new withdrawal and update balance
      await Account.updateOne(
        { _id: ACCOUNT_ID },
        {
          $push: { withdrawals: { value } },
          $inc: { balance: value * -1 }
        }
      )
      return res.sendStatus(200)
    } catch (error) {
      return res.status(500).json({ message: error.message })
    } finally {
      redis.del(PAYMENT_LOCK)
    }
  }
}

export default new AccountController()
