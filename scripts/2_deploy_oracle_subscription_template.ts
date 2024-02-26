import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { OracleSubscription } from '../artifacts/ts'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployOracleSubscriptionTemplate: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const priceRequestTemplate = deployer.getDeployContractResult('OraclePriceRequest')
  const subscriptionAllowedConsumerTemplate = deployer.getDeployContractResult('OracleSubscriptionAllowedConsumer')

  const result = await deployer.deployContract(OracleSubscription, {
    // The initial states of the faucet contract
    initialFields: {
      operator: '',
      subscriptionId: 0n,
      priceRequestTemplateId: priceRequestTemplate.contractInstance.contractId,
      subscriptionAllowedConsumerTemplateId: subscriptionAllowedConsumerTemplate.contractInstance.contractId,
      requestId: 0n,
      owner: deployer.account.address
    }
  })
  console.log('Oracle subscription template contract id: ' + result.contractInstance.contractId)
  console.log('Oracle subscription template address: ' + result.contractInstance.address)
}

export default deployOracleSubscriptionTemplate
