import { Router } from 'express'
import AccountController from './controllers/AccountController'

const routes = Router()

routes.get('/account', AccountController.getHistoric)
routes.post('/account/deposit', AccountController.deposit)
routes.post('/account/withdraw', AccountController.withdraw)

export default routes
