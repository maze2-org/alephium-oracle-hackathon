import { hexToString, web3 } from '@alephium/web3'
import { OracleOperator, OracleOperatorInstance, OracleOperatorTypes } from '../artifacts/ts'
import configuration from '../alephium.config'
import { Deployments } from '@alephium/cli'

const listenEvents = (
  operator: OracleOperatorInstance,
  events: OracleOperatorTypes.AddedNewSubscriptionEvent[],
  onNewEvent: () => any
) => {
  const subscribeOptions = {
    // It will check for new events from the full node every `pollingInterval`
    pollingInterval: 500,
    // The callback function will be called for each event
    messageCallback: (event: OracleOperatorTypes.AddedNewSubscriptionEvent): Promise<void> => {
      console.log({ event })
      events.push(event)
      onNewEvent()
      return Promise.resolve()
    },
    // This callback function will be called when an error occurs
    errorCallback: (error: any, subscription): Promise<void> => {
      console.log(error)
      subscription.unsubscribe()
      return Promise.resolve()
    }
  }

  operator.subscribeAddedNewSubscriptionEvent(subscribeOptions, 0)
}

const listenPricesRequest = (
  operator: OracleOperatorInstance,
  events: OracleOperatorTypes.PriceRequestedEvent[],
  onNewEvent: () => any
) => {
  const subscribeOptions = {
    // It will check for new events from the full node every `pollingInterval`
    pollingInterval: 500,
    // The callback function will be called for each event
    messageCallback: (event: OracleOperatorTypes.PriceRequestedEvent): Promise<void> => {
      console.log({ event })
      events.push(event)
      onNewEvent()
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
}

const listener = async () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')
  // The `TokenFaucet` contract instance from deploy result

  const deployments = await Deployments.load(configuration, 'devnet')
  const deployed = deployments.getDeployedContractResult(0, 'OracleOperator')

  if (!deployed) {
    console.error(`Oracle operator is not deployed on group 0`)
    process.exit(1)
  }

  const operator = OracleOperator.at(deployed?.contractInstance.address)

  // The `TokenFaucetTypes.WithdrawEvent` is generated in the getting-started guide
  const registeredSubscriptions: OracleOperatorTypes.AddedNewSubscriptionEvent[] = []
  const pricesRequests: OracleOperatorTypes.PriceRequestedEvent[] = []

  const displayStatus = () => {
    console.log('Registered subscriptions')
    console.table(registeredSubscriptions.map((e) => e.fields))

    console.log('Prices requests')
    console.table(
      pricesRequests.map((e) => {
        console.log(e)
        return {
          from: hexToString(e.fields.from),
          to: hexToString(e.fields.to)
        }
      })
    )
  }

  listenEvents(operator, registeredSubscriptions, displayStatus)
  listenPricesRequest(operator, pricesRequests, displayStatus)

  //   operator.subscribePriceRequestedEvent()
}

listener()
