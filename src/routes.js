import { Router } from 'express'
import AccountController from './controllers/AccountController'
import auth from './auth'

const routes = Router()

routes.get('/account', auth.validateAPIToken, AccountController.getHistoric)
routes.post('/account/deposit', auth.validateAPIToken, AccountController.deposit)
routes.post('/account/withdraw', auth.validateAPIToken, AccountController.withdraw)
routes.post('/account/payment', auth.validateAPIToken, AccountController.payment)

export default routes
