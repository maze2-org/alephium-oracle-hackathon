import axios from 'axios'

const ALLOWED_FROM_COIN = {
  ALPH: {
    coingeckoId: 'alephium',
    coinMarketCapId: 'ALPH'
  }
}

const ALLOWED_TO_CURRENCY = {
  USD: {
    coingeckoId: 'usd',
    coinMarketCapId: 'USD'
  }
}

export class WrongCurrencyError extends Error {
  constructor(message) {
    super(message)
    this.name = 'WrongCurrencyError'
  }
}

export class PriceDifferenceTooHigh extends Error {
  constructor(message) {
    super(message)
    this.name = 'PriceDifferenceTooHigh'
  }
}

/**
 *
 * @param {string} from Currency from (example: ALPH)
 * @param {string} to Currency to (example: USDT)
 * @param {number} allowedDiscrepency Allowed discrepency betwwen all price sources (example 0.1 for 10%)
 * @returns {Promise<number>} Return false if the price can't be retrieved
 */
export const retrievePrices = async (from: string, to: string, allowedDiscrepency: number = 0.1): Promise<number> => {
  if (!ALLOWED_FROM_COIN[from]) {
    throw new WrongCurrencyError(`${from} is not an allowed currency`)
  }

  if (!ALLOWED_TO_CURRENCY[to]) {
    throw new WrongCurrencyError(`${to} is not an allowed currency`)
  }

  // Getting price from coingecko
  const coingeckoFromId = ALLOWED_FROM_COIN[from].coingeckoId
  const coingeckoToId = ALLOWED_TO_CURRENCY[to].coingeckoId

  const responseFromCoingecko = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoFromId}&vs_currencies=${coingeckoToId}`
  )

  let priceFromCoingecko = responseFromCoingecko.data[coingeckoFromId][coingeckoToId]

  // Getting price from coinmarketcap
  const coinMarketCapFromId = ALLOWED_FROM_COIN[from].coinMarketCapId
  const coinMarketCapToId = ALLOWED_TO_CURRENCY[to].coinMarketCapId

  const responseFromCoinMarketCap = await axios.get(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${coinMarketCapFromId}`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': `${process.env.COINMARKETCAP_TOKEN}` // Remplacez par votre clé API CoinMarketCap
      }
    }
  )

  let priceFromCoinmarketcap =
    responseFromCoinMarketCap.data.data[coinMarketCapFromId]['quote'][coinMarketCapToId]['price']

  // If priceFromCoingecko and priceFromCoinmarketcap have more than 10% diff -> throw an error
  const averagePrice = (priceFromCoingecko + priceFromCoinmarketcap) / 2
  const priceDifference = Math.abs(priceFromCoingecko - priceFromCoinmarketcap)
  const maxAllowedDifference = allowedDiscrepency * averagePrice

  if (priceDifference > maxAllowedDifference) {
    throw new PriceDifferenceTooHigh(
      `There is too much difference between all prices sources, price difference is : ${priceDifference.toFixed(3)}`
    )
  }

  return averagePrice
}
