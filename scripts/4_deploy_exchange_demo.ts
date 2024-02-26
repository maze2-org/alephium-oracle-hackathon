import { Deployer, DeployFunction, Network } from '@alephium/cli'
import configuration, { Settings } from '../alephium.config'
import { MinimalistExchange, AddAllowedConsumer, RegisterSubscription } from '../artifacts/ts'
import { addressFromContractId, ExecuteScriptResult, ONE_ALPH, web3 } from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { ContractEventsByTxId } from '@alephium/web3/dist/src/api/api-alephium'

// This deploy function will be called by cli deployment tool automatically
// Note that deployment scripts should prefixed with numbers (starting from 0)
const deployOracleOperator: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const demoExchangeOwner = network.settings.demoExchangeOwner

  if (!demoExchangeOwner) {
    console.info('The exchange demo is not supposed to be deployed on this network')
    return
  }

  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  const exchangeOwnerSigner = new PrivateKeyWallet({
    privateKey: demoExchangeOwner,
    keyType: undefined,
    nodeProvider: web3.getCurrentNodeProvider()
  })
  const oracleOperator = deployer.getDeployContractResult('OracleOperator')

  let subscription: ExecuteScriptResult | null = null
  try {
    console.log(exchangeOwnerSigner.address)
    // Submit a transaction to use the transaction script
    subscription = await RegisterSubscription.execute(exchangeOwnerSigner, {
      initialFields: { operator: oracleOperator.contractInstance.contractId },
      attoAlphAmount: ONE_ALPH
    })

    if (!subscription) {
      console.error('Unable to publish the subscription')
      process.exit(4)
    }
  } catch (error: any) {
    console.error(error.message)
    process.exit(2)
  }

  const details: ContractEventsByTxId = await web3
    .getCurrentNodeProvider()
    .events.getEventsTxIdTxid(subscription.txId, undefined, {})

  const subscriptionContractId = details.events.find((event) => event.eventIndex === 0)?.fields[1].value.toString()

  if (!subscriptionContractId) {
    console.error('Unable to find the subscription contract id...')
    process.exit(5)
  }

  console.log(
    '\n------------------\nNEXT_SUBSCRIPTION_ADDRESS=' +
      addressFromContractId(subscriptionContractId) +
      '\n------------------\n'
  )

  const result = await deployer.deployContract(MinimalistExchange, {
    // The initial states of the faucet contract
    initialFields: {
      alphPriceInUsd: 0n,
      owner: exchangeOwnerSigner.address,
      priceRequestContractId: Buffer.from('').toString('hex'),
      subscriptionContractId: subscriptionContractId
    }
  })
  console.log(
    '\n------------------\nNEXT_MINIMAL_EXCHANGE_ADDRESS=' + result.contractInstance.address + '\n------------------\n'
  )

  // Add the contract in the consumer list
  subscription = await AddAllowedConsumer.execute(exchangeOwnerSigner, {
    initialFields: { subscription: subscriptionContractId, address: result.contractInstance.address },
    attoAlphAmount: ONE_ALPH
  })
}

export default deployOracleOperator
