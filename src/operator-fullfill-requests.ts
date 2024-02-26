import { DUST_AMOUNT, addressFromContractId, contractIdFromAddress, hexToString, web3 } from '@alephium/web3'
import {
  OracleOperator,
  OracleOperatorInstance,
  OracleOperatorTypes,
  OraclePriceRequest,
  RequestPrice,
  FulfillPriceRequest
} from '../artifacts/ts'
import configuration from '../alephium.config'
import { Deployments } from '@alephium/cli'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { PriceDifferenceTooHigh, WrongCurrencyError, retrievePrices } from './utils/retrieve-prices'

type PendingPriceRequest = {
  fulfilled: boolean | null
  request: OracleOperatorTypes.PriceRequestedEvent
  nbFailures: number
}

const fulfillPriceRequests = async () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  const deployments = await Deployments.load(configuration, 'devnet')
  const deployed = deployments.getDeployedContractResult(0, 'OracleOperator')

  if (!deployed) {
    console.error(`Oracle operator is not deployed on group 0`)
    process.exit(1)
  }

  const operator = OracleOperator.at(deployed.contractInstance.address)
  console.log('Operator address : ', deployed.contractInstance.address)

  const network = configuration.currentNetwork
  const privateKey = configuration.networks[network].privateKeys[0]
  const signer = new PrivateKeyWallet({ privateKey, keyType: undefined, nodeProvider: web3.getCurrentNodeProvider() })

  //   const pricesRequests: OracleOperatorTypes.PriceRequestedEvent[] = []

  const pendingPriceRequests: PendingPriceRequest[] = []

  const subscribeOptions = {
    // It will check for new events from the full node every `pollingInterval`
    pollingInterval: 500,
    // The callback function will be called for each event
    messageCallback: (event: OracleOperatorTypes.PriceRequestedEvent): Promise<void> => {
      console.log({ event })
      pendingPriceRequests.push({
        fulfilled: null,
        request: event,
        nbFailures: 0
      })
      return Promise.resolve()
    },
    // This callback function will be called when an error occurs
    errorCallback: (error: any, subscription): Promise<void> => {
      console.log(error)
      subscription.unsubscribe()
      return Promise.resolve()
    }
  }

  operator.subscribePriceRequestedEvent(subscribeOptions, 0)

  // Processing pending requests ...
  while (true) {
    console.log('Getting new entry to be fulfilled...')

    if (pendingPriceRequests.length > 0) {
      const pendingRequest = pendingPriceRequests[0]
      try {
        console.log('Processing pending request')
        const priceRequestData = await OraclePriceRequest.at(
          addressFromContractId(pendingRequest.request.fields.contractId)
        ).fetchState()

        let decimals = 8
        const price = await retrievePrices(
          hexToString(priceRequestData.fields.from),
          hexToString(priceRequestData.fields.to),
          0.1
        )
        let amount: bigint = BigInt(Math.round(price * Math.pow(10, decimals)).toString())

        if (!priceRequestData.fields.fulfilled) {
          await FulfillPriceRequest.execute(signer, {
            initialFields: {
              priceRequest: pendingRequest.request.fields.contractId,
              amount,
              decimals: BigInt(decimals)
            },
            attoAlphAmount: DUST_AMOUNT
          })
        }

        pendingPriceRequests[0].fulfilled = true
      } catch (error: any) {
        if (error instanceof PriceDifferenceTooHigh) {
          console.log(error.message)
        } else if (error instanceof WrongCurrencyError) {
          console.log('An error occurred while retrieving prices')
          console.log(error.message)
        } else if (error.message.includes('IOError$KeyNotFound')) {
          pendingPriceRequests[0].nbFailures = 5
          console.log('This request was removed')
        } else {
          console.log(`Unable to process the current entry, nb failures ${pendingPriceRequests[0].nbFailures}`)
          console.log(error)
          pendingPriceRequests[0].nbFailures++
        }
      } finally {
        if (pendingRequest.fulfilled || pendingRequest.nbFailures >= 5) {
          console.log('Removing first entry')
          pendingPriceRequests.shift()
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

fulfillPriceRequests()
