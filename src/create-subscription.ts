import { DUST_AMOUNT, ONE_ALPH, web3 } from '@alephium/web3'
import { RegisterSubscription } from '../artifacts/ts'
import configuration from '../alephium.config'
import { Deployments } from '@alephium/cli'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

const network = configuration.currentNetwork

const createSubscription = async () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  const wallet = PrivateKeyWallet.FromMnemonic({
    mnemonic:
      'brief practice chalk engage little gate random shoulder patient humble cabbage exhaust ordinary dance smile shrug script common become cram power crew convince amused'
  })
  console.log(wallet.privateKey)
  console.log(wallet.address)
  process.exit()

  // const deployments = await Deployments.load(configuration, network)
  // const deployed = deployments.getDeployedContractResult(0, 'OracleOperator')
  // const privateKey = configuration.networks[network].privateKeys[0]

  // const signer = new PrivateKeyWallet({ privateKey, keyType: undefined, nodeProvider: web3.getCurrentNodeProvider() })

  // console.log(`Signer address is : ${signer.account.address} - group ${signer.account.group}`)

  // if (!deployed) {
  //   console.error(`Oracle operator is not deployed on group 0`)
  //   process.exit(1)
  // }

  // try {
  //   console.log('Operator contract id is ', deployed.contractInstance.contractId)
  //   // Submit a transaction to use the transaction script
  //   const result = await RegisterSubscription.execute(signer, {
  //     initialFields: { operator: deployed.contractInstance.contractId },
  //     attoAlphAmount: ONE_ALPH
  //   })

  //   console.log(result)
  // } catch (error: any) {
  //   console.error(error.message)
  //   process.exit(2)
  // }
}

createSubscription()
