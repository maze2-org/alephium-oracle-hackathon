import { DUST_AMOUNT, ONE_ALPH, web3, addressFromContractId } from '@alephium/web3'
import {
  CompletePriceFetch,
  FetchPrice,
  MinimalistExchange,
  OraclePriceRequest,
  RegisterSubscription,
  RequestPrice
} from '../artifacts/ts'
import configuration from '../alephium.config'
import { Deployments } from '@alephium/cli'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

const network = configuration.currentNetwork

const processMinimalistLogic = async () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  const deployments = await Deployments.load(configuration, network)
  const deployed = deployments.getDeployedContractResult(0, 'MinimalistExchange')
  const privateKey = configuration.networks[network].settings.demoExchangeOwner

  console.log('Starting processing minimalist logic...')

  if (!privateKey) {
    console.error('Unable to get the demo exchange owner private key...')
    process.exit(1)
  }

  const signer = new PrivateKeyWallet({ privateKey, keyType: undefined, nodeProvider: web3.getCurrentNodeProvider() })

  console.log(`Signer address is : ${signer.account.address} - group ${signer.account.group}`)

  if (!deployed) {
    console.error(`Oracle operator is not deployed on group 0`)
    process.exit(2)
  }

  try {
    const data = await (await MinimalistExchange.at(deployed?.contractInstance.address).fetchState()).fields
    console.log('Last known alph price', data.alphPriceInUsd ? Number(data.alphPriceInUsd) / 1e8 : 'None')

    if (data.priceRequestContractId) {
      const request = await OraclePriceRequest.at(addressFromContractId(data.priceRequestContractId)).fetchState()
      const stateData = request.fields

      if (stateData.fulfilled) {
        console.log('Completing the price fetch...')
        await CompletePriceFetch.execute(signer, {
          initialFields: { myExchange: deployed.contractInstance.contractId },
          attoAlphAmount: ONE_ALPH
        })
      } else {
        console.log('Waiting for the oracle to fulfill the price...')
        process.exit()
      }
    } else {
      console.log('Fetch the new price...')
      // Submit a transaction to use the transaction script
      const result = await FetchPrice.execute(signer, {
        initialFields: { myExchange: deployed.contractInstance.contractId },
        attoAlphAmount: ONE_ALPH * 2n // One alph for storage (will be sent back after destroying), 0.5 to pay the gas fees for operator (the rest will be sent back also), 0.5 to pay the operator fees
      })
    }

    // console.log(data)

    // console.log(result)
  } catch (error: any) {
    console.error(error.message)
    process.exit(2)
  }
}

processMinimalistLogic()
