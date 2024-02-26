import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { OraclePriceRequest, OracleSubscription } from '../artifacts/ts'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployOraclePriceRequestTemplate: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get settings
  const result = await deployer.deployContract(OraclePriceRequest, {
    // The initial states of the faucet contract
    initialFields: {
      amount: 0n,
      decimals: 8n,
      from: Buffer.from('ALPH', 'utf-8').toString('hex'),
      to: Buffer.from('USDT', 'utf-8').toString('hex'),
      fulfilled: false,
      subscription: Buffer.from('', 'utf-8').toString('hex'),
      oracleFees: 0n
    }
  })
}

export default deployOraclePriceRequestTemplate
