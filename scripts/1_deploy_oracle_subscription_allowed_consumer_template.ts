import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { OraclePriceRequest, OracleSubscription } from '../artifacts/ts'
import { OracleSubscriptionAllowedConsumer } from '../artifacts/ts/OracleSubscriptionAllowedConsumer'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployOracleSubscriptionAllowedConsumerTemplate: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get settings
  const result = await deployer.deployContract(OracleSubscriptionAllowedConsumer, {
    // The initial states of the faucet contract
    initialFields: {
      consumerAddress: deployer.account.address
    }
  })
  console.log('Oracle price request contract id: ' + result.contractInstance.contractId)
  console.log('Oracle price request address: ' + result.contractInstance.address)
}

export default deployOracleSubscriptionAllowedConsumerTemplate
