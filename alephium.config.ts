import { Configuration } from '@alephium/cli'

require('dotenv').config({ path: ['.env.local', '.env'] })

console.log('Loading configuration...')
// Settings are usually for configuring
export type Settings = {
  demoExchangeOwner?: string
}

const configuration: Configuration<Settings> & { currentNetwork: 'devnet' | 'testnet' | 'mainnet' } = {
  // enableDebugMode: true,
  currentNetwork: 'devnet',
  networks: {
    devnet: {
      nodeUrl: 'http://localhost:22973',
      // here we could configure which address groups to deploy the contract
      privateKeys: ['a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'],
      settings: {
        demoExchangeOwner: process.env.EXCHANGE_OWNER_PRIVATE_KEY
      }
    },

    testnet: {
      nodeUrl: process.env.NODE_URL as string,
      privateKeys: process.env.PRIVATE_KEYS === undefined ? [] : process.env.PRIVATE_KEYS.split(','),
      settings: {}
    },

    mainnet: {
      nodeUrl: process.env.NODE_URL as string,
      privateKeys: process.env.PRIVATE_KEYS === undefined ? [] : process.env.PRIVATE_KEYS.split(','),
      settings: {}
    }
  }
}

export default configuration
