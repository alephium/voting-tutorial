import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  createContract,
  initialContractState,
  hexStringToStr,
  allocateTokenScript,
  createVotingScript,
  closeVotingScript
} from './util/voting'
import { CONTRACTGAS } from './util/client'
import { Address, Bool, ByteVec, U256, TxResult } from 'alephium-js/dist/api/api-alephium'
import { NetworkBadge } from './components/NetworkBadge'
import Client, { NetworkType } from './util/client'

const App = () => {
  const settings = {
    nodeHost: 'http://localhost:12973',
    explorerURL: 'https://testnet.alephium.org',
    wallet1: {
      name: 'wallet-1',
      password: 'my-secret-password'
    }
  }

  const [contractDeploymentId, setContractDeploymentId] = useState('')
  const [networkType, setNetworkType] = useState<NetworkType | undefined>(undefined)

  const client = useMemo(
    () => new Client(settings.nodeHost, settings.wallet1.name, settings.wallet1.password),
    [settings.nodeHost, settings.wallet1.name, settings.wallet1.password]
  )

  const pollNetworkType = (client: Client) => {
    client
      .getNetworkType()
      .then(setNetworkType)
      .catch(() => setNetworkType(NetworkType.UNREACHABLE))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      pollNetworkType(client)
    }, 15000)
    pollNetworkType(client)
    return () => clearInterval(interval)
  }, [client])

  const deployNewContract = async () => {
    await client.walletUnlock()
    const wallet1Address = await client.getActiveAddress()
    const votingSetup = {
      title: 'My first voting contract',
      voters: [wallet1Address],
      administrator: wallet1Address
    }
    const contractStringCode = createContract(votingSetup.voters.length)
    const state = initialContractState(votingSetup.title, votingSetup.administrator, votingSetup.voters)
    const contractTxResult: TxResult = await client.deployContract(
      contractStringCode,
      CONTRACTGAS,
      state,
      `${votingSetup.voters.length}`
    )
    logTransactionUrl(settings.explorerURL, contractTxResult.txId)
  }

  const showState = async (contractDeploymentId: string) => {
    const state = await client.getContractState(contractDeploymentId)
    const title = hexStringToStr((state.fields[0] as ByteVec).value)
    const yes = (state.fields[1] as U256).value
    const no = (state.fields[2] as U256).value
    const isClosed = (state.fields[3] as Bool).value
    const initialized = (state.fields[4] as Bool).value
    const admin = (state.fields[5] as Address).value
    const voters = state.fields.slice(6, state.fields.length).map((val) => val.value)
    const stateString = `
      Title: ${title}
      Yes: ${yes}
      No: ${no}
      isClosed: ${isClosed}
      initialized: ${initialized}
      admin: ${admin}
      voters: [${voters}]
      `
    alert(stateString)
    console.log(stateString)
  }

  const allocateTokens = async (contractDeploymentId: string) => {
    await client.walletUnlock()
    const contractRef = await client.getContractRef(contractDeploymentId)
    const nVoters = await client.getNVoters(contractDeploymentId)
    const txScript = allocateTokenScript(contractRef, nVoters)
    const txResult = await client.deployScript(txScript)
    logTransactionUrl(settings.explorerURL, txResult.txId)
  }

  const vote = async (contractDeploymentId: string, choice: boolean) => {
    await client.walletUnlock()
    const contractRef = await client.getContractRef(contractDeploymentId)
    const nVoters = await client.getNVoters(contractDeploymentId)
    const txScript = createVotingScript(choice, contractRef, nVoters)
    const txResult = await client.deployScript(txScript)
    logTransactionUrl(settings.explorerURL, txResult.txId)
  }

  const close = async (contractDeploymentId: string) => {
    await client.walletUnlock()
    const contractRef = await client.getContractRef(contractDeploymentId)
    const nVoters = await client.getNVoters(contractDeploymentId)
    const txScript = closeVotingScript(contractRef, nVoters)
    const txResult = await client.deployScript(txScript)
    logTransactionUrl(settings.explorerURL, txResult.txId)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Voting dApp Tutorial</h1>
        {networkType !== undefined && <NetworkBadge networkType={networkType} />}
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
