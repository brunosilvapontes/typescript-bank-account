const auth = require('./auth')
const AccountController = require('./controllers/AccountController')
const routes = require('express').Router()
const accountControl = new AccountController()

routes.get('/account', auth.validateAPIToken, accountControl.getHistoric)
routes.post('/account/deposit', auth.validateAPIToken, accountControl.deposit)
routes.post('/account/withdraw', auth.validateAPIToken, accountControl.withdraw)
routes.post('/account/pay', auth.validateAPIToken, accountControl.payment)

module.exports = routes
