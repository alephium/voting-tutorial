import { useState } from 'react'
import './App.css'
import Client from './util/client'

const App = () => {
  const settings = {
    nodeHost: 'http://localhost:12973',
    explorerURL: 'https://testnet.alephium.org',
    wallet1: {
      name: 'wallet-1',
      password: 'my-secret-password'
    },
    wallet2: {
      name: 'wallet-2',
      password: 'my-secret-password'
    }
  }

  const [contractDeploymentId, setContractDeploymentId] = useState('')
  const client = new Client(settings.nodeHost, settings.wallet1.name, settings.wallet1.password)

  const deployNewContract = async () => {
    return Promise.reject('Not implemented yet')
  }

  const allocateTokens = async (contractDeploymentId: string) => {
    return Promise.reject('Not implemented yet')
  }

  const vote = async (contractDeploymentId: string, choice: boolean) => {
    return Promise.reject('Not implemented yet')
  }

  const close = async (contractDeploymentId: string) => {
    return Promise.reject('Not implemented yet')
  }

  const showState = async (contractDeploymentId: string) => {
    return Promise.reject('Not implemented yet')
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Voting dApp Tutorial</h1>
        <div className="container">
          <h2>Deploy the voting contract</h2>
          <button onClick={() => catchAndAlert(deployNewContract())}>Create Contract</button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2>Interact with the contract</h2>
            <div className="styledInputDiv">
              <input
                type="text"
                placeholder="Please enter the txId of the contract deployment"
                onChange={(e) => setContractDeploymentId(e.target.value)}
                value={contractDeploymentId}
              />
            </div>
            <button onClick={() => catchAndAlert(showState(contractDeploymentId))}>Show contract state</button>
            <button onClick={() => catchAndAlert(allocateTokens(contractDeploymentId))}>Allocate Tokens</button>
            <button onClick={() => catchAndAlert(vote(contractDeploymentId, true))}>Vote yes</button>
            <button onClick={() => catchAndAlert(vote(contractDeploymentId, false))}>Vote no</button>
            <button onClick={() => catchAndAlert(close(contractDeploymentId))}>Close voting</button>
          </div>
        </div>
      </header>
    </div>
  )
}

function logTransactionUrl(explorerUrl: string, txId: string) {
  return console.log(
    `Check your transaction here ${explorerUrl}/#/transactions/${txId}. Reload the explorer page if the transaction is not found.`
  )
}

// eslint-disable-next-line
const catchAndAlert = (action: Promise<any>) => {
  action.catch((e) => {
    if (e != undefined && e.error != undefined && e.error.detail != undefined) {
      alert(e.error.detail)
    } else {
      alert(e)
    }
  })
}

export default App
