import { DUST_AMOUNT, ONE_ALPH, web3 } from '@alephium/web3'
import { OracleOperator, RegisterSubscription } from '../artifacts/ts'
import configuration from '../alephium.config'
import { Deployments } from '@alephium/cli'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

const network = configuration.currentNetwork

const createSubscription = async () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  const deployments = await Deployments.load(configuration, network)
  const deployed = deployments.getDeployedContractResult(0, 'OracleOperator')
  const privateKey = configuration.networks[network].privateKeys[0]

  const signer = new PrivateKeyWallet({ privateKey, keyType: undefined, nodeProvider: web3.getCurrentNodeProvider() })

  console.log(`Signer address is : ${signer.account.address} - group ${signer.account.group}`)

  if (!deployed) {
    console.error(`Oracle operator is not deployed on group 0`)
    process.exit(1)
  }

  try {
    const data = await OracleOperator.at(deployed?.contractInstance.address).fetchState()
    console.log(data)
  } catch (error: any) {
    console.error(error.message)
    process.exit(2)
  }
}

createSubscription()
