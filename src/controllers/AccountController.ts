import { Request, Response } from 'express'
import Account from '../schemas/Account'
import { Tedis } from 'tedis'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// This solution is using a predefined account
const ACCOUNT_ID = '5f0d26f2b027fd046c594ab1'

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

  public deposit = async (req: Request, res: Response): Promise<Response> => {
    try {
      let message = ''
      const account = await Account.findById(ACCOUNT_ID)
      if (!account) {
        message = 'Conta não encontrada'
        return res.status(404).json({ message })
      }

      const value = Number(req.query.value)
      message = this.getInputValueError(value)
      if (message) return res.status(400).json({ message })

      // Append a new deposit and update balance
      await Account.updateOne(
        { _id: ACCOUNT_ID },
        {
          $push: { deposits: { timestamp: new Date(), value } },
          $inc: { balance: value }
        }
      )
      return res.sendStatus(200)
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }

  private getInputValueError = (value: number): string => {
    let message = ''
    if (isNaN(value)) {
      message = 'Valor não foi passado ou não é um número'
    } else if (!Number.isInteger(value)) {
      message = 'Valor deve ser passado em centavos (número inteiro)'
    } else if (value < 1) {
      message = 'Valor deve ser maior que 0'
    }
    return message
  }

  public withdraw = async (req: Request, res: Response): Promise<Response> => {
    try {
      let message = ''
      const value = Number(req.query.value)
      message = this.getInputValueError(value)
      if (message) return res.status(400).json({ message })

      // Check if there is enough balance
      const account = await Account.findById(ACCOUNT_ID, 'balance')
      if (!account) {
        message = 'Conta não encontrada'
        return res.status(404).json({ message })
      }
      if (account.balance < value) {
        message = 'Seu saldo não é suficiente para realizar o resgate'
        return res.status(400).json({ message })
      }

      // Check if a payment is blocking withdrawals
      let paymentBlock = await redis.get(PAYMENT_LOCK)
      if (paymentBlock) {
        // Try again after a few seconds
        await new Promise(resolve => setTimeout(resolve, 2000))
        paymentBlock = await redis.get(PAYMENT_LOCK)
        if (paymentBlock) {
          message = 'Sua conta tem um pagamento em andamento, tente novamente'
          return res.status(409).json({ message })
        }
      }

      // Append a new withdrawal and update balance
      await Account.updateOne(
        { _id: ACCOUNT_ID },
        {
          $push: { withdrawals: { timestamp: new Date(), value } },
          $inc: { balance: value * -1 }
        }
      )
      return res.sendStatus(200)
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }
}

export default new AccountController()
