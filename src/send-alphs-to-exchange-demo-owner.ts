import { ONE_ALPH, web3 } from '@alephium/web3'
import configuration from '../alephium.config'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { transferAlphTo } from './utils/transfer'

const sendAlphsToExchangeDemoOwner = async () => {
  web3.setCurrentNodeProvider('http://127.0.0.1:22973')

  const network = configuration.currentNetwork
  const demoExchangeOwner = configuration.networks[network].settings.demoExchangeOwner

  if (configuration.currentNetwork === 'mainnet') {
    console.error('This script is not intended to be ran on the mainnet')
    process.exit(1)
  }

  if (!demoExchangeOwner) {
    console.error('No private key defined to deploy the exchange demo')
    process.exit(2)
  }

  const exchangeOwnerSigner = new PrivateKeyWallet({
    privateKey: demoExchangeOwner,
    keyType: undefined,
    nodeProvider: web3.getCurrentNodeProvider()
  })

  const deployerSigner = new PrivateKeyWallet({
    privateKey: configuration.networks[network].privateKeys[0],
    keyType: undefined,
    nodeProvider: web3.getCurrentNodeProvider()
  })

  try {
    console.log('Sending funds to ', exchangeOwnerSigner.address)
    await transferAlphTo(deployerSigner, exchangeOwnerSigner.address, ONE_ALPH * 10n)
    console.log('Owner of the exchange :', exchangeOwnerSigner.address)
  } catch (error: any) {
    console.error(error.message)
    process.exit(3)
  }
}

sendAlphsToExchangeDemoOwner()
