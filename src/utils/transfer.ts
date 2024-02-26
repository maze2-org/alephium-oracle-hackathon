import { Number256, SignerProviderSimple } from '@alephium/web3'
import { NodeWallet, PrivateKeyWallet } from '@alephium/web3-wallet'

export const transferAlphTo = async (from: PrivateKeyWallet, toAddress: string, attoAlphAmount: Number256) => {
  await from.signAndSubmitTransferTx({
    signerAddress: from.address,
    destinations: [
      {
        address: toAddress,
        attoAlphAmount
      }
    ]
  })
}
