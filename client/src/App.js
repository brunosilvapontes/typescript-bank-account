import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'

function App() {
  const [historic, setHistoric] = useState(0)
  const [balance, setBalance] = useState('carregando')
  const [depositValue, setDepositValue] = useState('')
  const [withdrawalValue, setWithdrawalValue] = useState('')
  const [paymentValue, setPaymentValue] = useState('')
  const [barcode, setBarcode] = useState('')
  const [transactionMsg, setTransactionMsg] = useState('')
  const apiToken = 'jstsj4stxFFFFsjs6t77sJStsT44SjsTSj5asTSjs'
  const host = 'http://localhost:3333/'

  useEffect(() => {
    axios.get(`${host}account`, { headers: { apitoken: apiToken } })
      .then(res => {
        setHistoric(getHistoricHTML(res.data.transactions))
        setBalance(res.data.balance)
      })
  }, [balance, transactionMsg])

  function getHistoricHTML(_transactions) {
    return _transactions.map(transac => {
      return (
        <li>
          <strong>TIPO:</strong> {transac.type}
          <strong> HORÁRIO:</strong> {transac.timestamp}
          <strong> VALOR:</strong> {transac.value}
        </li>
      )
    })
  }

  const deposit = (event) => {
    axios.post(`${host}account/deposit?value=${depositValue}`, {}, { headers: { apitoken: apiToken } })
      .then(res => {
        setBalance('carregando')
        setTransactionMsg('Depósito realizado com sucesso')
      })
      .catch(error => {
        setTransactionMsg(`ERRO: ${error.response.data.message} STATUS: ${error.response.status}`)
      })
  }

  const withdraw = (event) => {
    axios.post(`${host}account/withdraw?value=${withdrawalValue}`, {}, { headers: { apitoken: apiToken } })
      .then(res => {
        setBalance('carregando')
        setTransactionMsg('Resgate realizado com sucesso')
      })
      .catch(error => {
        setTransactionMsg(`ERRO: ${error.response.data.message} STATUS: ${error.response.status}`)
      })
  }

  const pay = (event) => {
    axios.post(`${host}account/pay?value=${paymentValue}&barcode=${barcode}`, {}, { headers: { apitoken: apiToken } })
      .then(res => {
        setBalance('carregando')
        setTransactionMsg('Pagamento realizado com sucesso')
      })
      .catch(error => {
        setTransactionMsg(`ERRO: ${error.response.data.message} STATUS: ${error.response.status}`)
      })
  }

  const handleDepositValue = (event) => {
    const value = event.target.value.toString().replace(',', '.')
    setDepositValue(value)
  }

  const handleWithdrawalValue = (event) => {
    const value = event.target.value.toString().replace(',', '.')
    setWithdrawalValue(value)
  }

  const handleBarcode = (event) => {
    const value = event.target.value.toString().trim()
    setBarcode(value)
  }

  const handlePaymentValue = (event) => {
    const value = event.target.value.toString().replace(',', '.')
    setPaymentValue(value)
  }

  return (
    <div className="App">
      <h1>Operações bancárias</h1>
      <h2>Mensagem da última operação:</h2> {transactionMsg}
      <div>
        <h2>Extrato</h2>
        <h3>Saldo: {balance}</h3>
        <h3>Histórico:</h3>
        <ul>{historic}</ul>
      </div>
      <div>
        <h2>Depósito</h2>
        <label>
          Valor: <input type="text" onChange={handleDepositValue} />
        </label>
        <button onClick={deposit}>Depositar</button>
      </div>
      <div>
        <h2>Resgate</h2>
        <label>
          Valor: <input type="text" onChange={handleWithdrawalValue} />
        </label>
        <button onClick={withdraw}>Resgatar</button>
      </div>
      <div>
        <h2>Pagamento</h2>
        <label>
          Valor: <input type="text" onChange={handlePaymentValue} />
        </label>
        <label>
          Código de barras: <input type="text" onChange={handleBarcode} />
        </label>
        <button onClick={pay}>Pagar</button>
      </div>
    </div>
  );
}


export default App;
