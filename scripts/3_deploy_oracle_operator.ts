import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { OracleOperator } from '../artifacts/ts'
import { ONE_ALPH } from '@alephium/web3'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployOracleOperator: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const subscriptionTemplate = deployer.getDeployContractResult('OracleSubscription')
  const priceRequestTemplate = deployer.getDeployContractResult('OraclePriceRequest')
  const subscriptionAllowedConsumerTemplate = deployer.getDeployContractResult('OracleSubscriptionAllowedConsumer')

  const result = await deployer.deployContract(OracleOperator, {
    // The initial states of the faucet contract
    initialFields: {
      publicKey: Buffer.from('MyPublicKey', 'utf8').toString('hex'),
      subscriptionCount: 0n,
      subscriptionTemplateId: subscriptionTemplate.contractInstance.contractId,
      priceRequestTemplateId: priceRequestTemplate.contractInstance.contractId,
      subscriptionAllowedConsumerTemplateId: subscriptionAllowedConsumerTemplate.contractInstance.contractId,
      fees: ONE_ALPH / 2n, // Oracle fees are currently 0.5 alph
      manager: deployer.account.address
    }
  })
  console.log('Oracle operator contract id: ' + result.contractInstance.contractId)
  console.log('Oracle operator address: ' + result.contractInstance.address)
}

export default deployOracleOperator
