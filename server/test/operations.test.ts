import app from '../src/app'
import chai from 'chai'
import chaiHttp from 'chai-http'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const should = chai.should()
chai.use(chaiHttp)
const assert = chai.assert

describe('Security - Do not authorize requests without correct header', () => {
  it('Should reject GET /account without apitoken header', (done) => {
    chai.request(app)
      .get('/account').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })

  it('Should reject POST /account/deposit without apitoken header', (done) => {
    chai.request(app)
      .post('/account/deposit').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })
  it('Should reject POST /account/withdraw without apitoken header', (done) => {
    chai.request(app)
      .post('/account/withdraw').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })
  it('Should reject POST /account/pay without apitoken header', (done) => {
    chai.request(app)
      .post('/account/pay').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })

  it('Should reject GET /account with wrong apitoken header', (done) => {
    chai.request(app)
      .get('/account').set('apitoken', 'wrong apitoken header').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })

  it('Should reject POST /account/deposit with wrong apitoken header', (done) => {
    chai.request(app)
      .post('/account/deposit').set('apitoken', 'wrong apitoken header').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })
  it('Should reject POST /account/withdraw with wrong apitoken header', (done) => {
    chai.request(app)
      .post('/account/withdraw').set('apitoken', 'wrong apitoken header').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })
  it('Should reject POST /account/pay with wrong apitoken header', (done) => {
    chai.request(app)
      .post('/account/pay').set('apitoken', 'wrong apitoken header').end((err, res) => {
        res.should.have.status(401)
        done()
      })
  })
})

describe('Get historic and balance', () => {
  // TODO Check if transactions are adding elements to transactions' array
  // TODO Check new transaction element correctness
  it('Return historic and balance fields', (done) => {
    chai.request(app).get('/account')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('balance')
        res.body.should.have.property('transactions')
        done()
      })
  })
})

describe('Deposit', () => {
  let responseBefore, responseAfter
  it('Check balance before and after a deposit', async () => {
    // TODO Check new deposit element correctness
    const depositValue = 1
    responseBefore = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })

    await new Promise(resolve => {
      chai.request(app).post(`/account/deposit?value=${depositValue}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve())
    })

    responseAfter = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })

    assert.equal(responseBefore.balance, responseAfter.balance - depositValue)
  })

  it('Check if a new deposit record was created in account', (done) => {
    assert.lengthOf(responseBefore.transactions, responseAfter.transactions.length - 1)
    done()
  })

  it('Bad request on negative value', (done) => {
    chai.request(app).post('/account/deposit?value=-1')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Bad request on zero value', (done) => {
    chai.request(app).post('/account/deposit?value=0')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Bad request on string value', (done) => {
    chai.request(app).post('/account/deposit?value=abc')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })
})

describe('Withdraw', () => {
  let responseBefore, responseAfter, responseAfterDenial
  it('Check balance before and after a withdrawal', async () => {
    // TODO Check new withdrawal element correctness
    const withdrawalValue = 1

    // Ensure there is enough balance to withdraw
    await new Promise(resolve => {
      chai.request(app).post(`/account/deposit?value=${withdrawalValue}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve())
    })

    responseBefore = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })

    await new Promise(resolve => {
      chai.request(app).post(`/account/withdraw?value=${withdrawalValue}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve())
    })

    responseAfter = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })

    assert.equal(responseBefore.balance, responseAfter.balance + withdrawalValue)
  })

  it('Check if a new withdrawal record was created in account', (done) => {
    assert.lengthOf(responseBefore.transactions, responseAfter.transactions.length - 1)
    done()
  })

  it('Bad request on negative value', (done) => {
    chai.request(app).post('/account/withdraw?value=-1')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Bad request on zero value', (done) => {
    chai.request(app).post('/account/withdraw?value=0')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Bad request on string value', (done) => {
    chai.request(app).post('/account/withdraw?value=abc')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Deny to withdraw a value greater than balance', async () => {
    const balanceBefore = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body.balance))
    })

    const response = await new Promise(resolve => {
      chai.request(app).post(`/account/withdraw?value=${balanceBefore + 1}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res))
    })
    response.should.have.status(400)

    responseAfterDenial = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })
    assert.equal(balanceBefore, responseAfterDenial.balance)
  })

  it('Check if no withdrawal record was created in account after denial', (done) => {
    assert.lengthOf(responseAfter.transactions, responseAfterDenial.transactions.length)
    done()
  })
})

describe('Pay', () => {
  const barcode = Math.random()
  let responseBefore, responseAfter, responseAfterDenial
  it('Check balance before and after a payment', async () => {
    // TODO Check new payment element correctness
    // TODO Check business account balance before and after a payment
    // TODO Check if a new object was pushed into receivedPayments array of business account
    // TODO Check if a payment was created
    const paymentValue = 1

    // Ensure there is enough balance to pay
    await new Promise(resolve => {
      chai.request(app).post(`/account/deposit?value=${paymentValue * 2}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve())
    })

    responseBefore = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })

    await new Promise(resolve => {
      chai.request(app).post(`/account/pay?value=${paymentValue}&barcode=${barcode}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve())
    })

    responseAfter = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })

    assert.equal(responseBefore.balance, responseAfter.balance + paymentValue)
  })

  it('Check if a new payment record was created in account', (done) => {
    assert.lengthOf(responseBefore.transactions, responseAfter.transactions.length - 1)
    done()
  })

  it('Deny to pay the same barcode', async () => {
    const balanceBefore = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body.balance))
    })

    const response = await new Promise(resolve => {
      chai.request(app).post(`/account/pay?value=1&barcode=${barcode}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res))
    })
    response.should.have.status(400)

    responseAfterDenial = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })

    assert.equal(balanceBefore, responseAfterDenial.balance)
  })

  it('Check if no payment record was created in account after the attempt to pay using the same barcode', (done) => {
    assert.lengthOf(responseAfter.transactions, responseAfterDenial.transactions.length)
    done()
  })

  it('Bad request on negative value', (done) => {
    chai.request(app).post(`/account/pay?value=-1&barcode=${Math.random()}`)
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Bad request when requesting without barcode', (done) => {
    chai.request(app).post('/account/pay?value=1')
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Bad request on zero value', (done) => {
    chai.request(app).post(`/account/pay?value=0&barcode=${Math.random()}`)
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Bad request on string value', (done) => {
    chai.request(app).post(`/account/pay?value=abc&barcode=${Math.random()}`)
      .set('apitoken', process.env.APITOKEN).end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it('Deny to pay a value greater than balance', async () => {
    const balanceBefore = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body.balance))
    })

    const response = await new Promise(resolve => {
      chai.request(app).post(`/account/pay?value=${balanceBefore + 1}&barcode=${Math.random()}`)
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res))
    })
    response.should.have.status(400)

    responseAfterDenial = await new Promise(resolve => {
      chai.request(app).get('/account')
        .set('apitoken', process.env.APITOKEN).end((err, res) => resolve(res.body))
    })
    assert.equal(balanceBefore, responseAfterDenial.balance)
  })

  it('Check if no payment record was created in account after the attempt to pay a value greater than balance', (done) => {
    assert.lengthOf(responseAfter.transactions, responseAfterDenial.transactions.length)
    done()
  })
})
