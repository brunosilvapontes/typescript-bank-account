import { Request, Response } from 'express'
import Account from '../schemas/Account'

class AccountController {
  private accountId = '5f0d26f2b027fd046c594ab1'

  public getHistoric = async (req: Request, res: Response): Promise<Response> => {
    const accounts = await Account.findById(this.accountId)
    console.log(accounts)
    return res.json(accounts)
  }

  public deposit = async (req: Request, res: Response): Promise<Response> => {
    const value = Number(req.query.value)

    // Validate input value
    let message = ''
    if (isNaN(value)) {
      message = 'Valor não foi passado ou não é um número'
    } else if (!Number.isInteger(value)) {
      message = 'Valor deve ser passado em centavos (número inteiro)'
    } else if (value < 1) {
      message = 'Valor deve ser maior que 0'
    }
    if (message) return res.status(400).json({ message })

    // Append a new deposit and update balance
    await Account.updateOne(
      { _id: this.accountId },
      {
        $push: { deposits: { timestamp: new Date(), value } },
        $inc: { balance: value }
      }
    )
    return res.sendStatus(200)
  }
}

export default new AccountController()
