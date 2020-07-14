import { Router } from 'express'
import UserController from './controllers/AccountController'

const routes = Router()

routes.get('/account', UserController.index)
// routes.post('/account', UserController.store)

export default routes
