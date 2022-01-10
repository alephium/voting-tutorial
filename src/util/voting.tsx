import { ContractRef } from './client'

const utxoFee = '50000000000000'
export function createContract(nVoters: number): string {
  const votersTransfers: string[] = []
  for (let i = 0; i < nVoters; i++) {
    votersTransfers.push(`transferAlph!(admin, voters[${i}], ${utxoFee})`)
    votersTransfers.push(`transferTokenFromSelf!(voters[${i}], selfTokenId!(), 1)`)
  }
  return `
   TxContract Voting(
     title: ByteVec,
     mut yes: U256,
     mut no: U256,
     mut isClosed: Bool,
     mut initialized: Bool,
     admin: Address,
     voters: [Address; ${nVoters}]
   ) {
     pub payable fn allocateTokens() -> () {
        assert!(initialized == false)
        assert!(txCaller!(txCallerSize!() - 1) == admin)
        ${votersTransfers.join('\n')}
        yes = 0
        no = 0
        initialized = true
     }

     pub payable fn vote(choice: Bool, voter: Address) -> () {
       assert!(initialized == true && isClosed == false)
       transferAlph!(voter, admin, ${utxoFee})
       transferTokenToSelf!(voter, selfTokenId!(), 1)
       if (choice == true) {
          yes = yes + 1
       } else {
          no = no + 1
       }
     }

      pub fn close() -> () {
        assert!(initialized == true && isClosed == false)
        assert!(txCaller!(txCallerSize!() - 1) == admin)
        isClosed = true
      }
    }`
}

export function createVotingScript(choice: boolean, contractRef: ContractRef, nVoters: number): string {
  return `TxScript VotingScript {
      pub payable fn main() -> () {
        let caller = txCaller!(0)
        let voting = Voting(#${contractRef.tokenId})
        approveToken!(caller, #${contractRef.tokenId}, 1)
        approveAlph!(caller, ${utxoFee})
        voting.vote(${choice}, caller)
      }
    }
    ${createContract(nVoters)}
    `
}

export function allocateTokenScript(contractRef: ContractRef, nVoters: number): string {
  return `TxScript TokenAllocation {
    pub payable fn main() -> () {
      let voting = Voting(#${contractRef.tokenId})
      let caller = txCaller!(0)
      approveAlph!(caller, ${utxoFee} * ${nVoters})
      voting.allocateTokens()
    }
  }
  ${createContract(nVoters)}
  `
}

export function closeVotingScript(contractRef: ContractRef, nVoters: number): string {
  return `TxScript ClosingScript {
    pub payable fn main() -> () {
      let voting = Voting(#${contractRef.tokenId})
      voting.close()
    }
  }
  ${createContract(nVoters)}
  `
}

export function initialContractState(title: string, adminAddress: string, voters: string[]): string {
  return `[#${strToHexString(title)}, 0, 0, false, false, @${adminAddress}, [${voters
    .map((voter) => `@${voter}`)
    .join(', ')}]]`
}

export function strToHexString(str: string) {
  return Buffer.from(str).toString('hex')
}

export function hexStringToStr(str: string) {
  return Buffer.from(str, 'hex').toString()
}
