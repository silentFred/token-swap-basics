import { parseAddress } from '@/app/api/quote/parseAddress'

// Incoming data from external sources should be parsed and validated
// Handle parsing failures/ network errors
export const parseLifiQuoteResponse = (response: any): LifiQuoteResponse => {
    return {
        estimate: {
            executionDuration: response.estimate.executionDuration,
            toAmountMin: response.estimate.toAmountMin,
            gasCosts: response.estimate.gasCosts.map((gasCost: any) => {
                return {
                    type: gasCost.type,
                    // TODO parse all 'untrusted' data from external sources
                    amountUSD: parseFloat(gasCost.amountUSD),
                    amount: gasCost.amount,
                    token: {
                        address: parseAddress(gasCost.token.address),
                        chainId: gasCost.token.chainId,
                        symbol: gasCost.token.symbol,
                        decimals: gasCost.token.decimals,
                        name: gasCost.token.name,
                        coinKey: gasCost.token.coinKey,
                        logoURI: gasCost.token.logoURI,
                        priceUSD: gasCost.token.priceUSD,
                    },
                }
            }),
            approvalAddress: parseAddress(response.estimate.approvalAddress),
        },
        transactionRequest: response.transactionRequest,
    }
}
