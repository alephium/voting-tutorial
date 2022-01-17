import styled from 'styled-components'
import { NetworkType } from '../util/client'

interface NetworkBadgeProps {
  networkType: NetworkType
}

export const NetworkBadge = ({ networkType }: NetworkBadgeProps) => {
  const networkTypeToText = (networkType: NetworkType) => {
    if (networkType === NetworkType.MAINNET) {
      return 'Mainnet'
    } else if (networkType === NetworkType.TESTNET) {
      return 'Testnet'
    } else if (networkType === NetworkType.UNKNOWN) {
      return 'Unknown network'
    } else {
      return 'Unreachable node'
    }
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Badge>{networkTypeToText(networkType)}</Badge>
      {networkType !== NetworkType.TESTNET && <DangerLogo />}
    </div>
  )
}

const DangerLogo = () => {
  return <DangerLogoSpan>&#9888;</DangerLogoSpan>
}

const DangerLogoSpan = styled.span`
  color: red;
  font-size: 25px;
  margin-left: 10px;
`

const Badge = styled.button`
  background-color: white;
  border-radius: 15px;
  border-width: 1px;
  border-style: solid;
  border-color: #d1d1d1;
  margin-left: 20px;
  padding-top: 0px;
  padding-left: 10px;
  padding-right: 10px;
  height: 30px;
  &:hover {
    border-color: #d1d1d1;
  }
  &:active {
    background-color: white;
  }
`
