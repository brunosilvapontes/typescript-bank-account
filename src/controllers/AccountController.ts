import { Request, Response } from 'express'
import Account from '../schemas/Account'

class AccountController {
  public async index (req: Request, res: Response): Promise<Response> {
    const accounts = await Account.find()
    return res.json(accounts)
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const account = await Account.create(req.body)
    return res.json(account)
  }
}

export default new AccountController()
