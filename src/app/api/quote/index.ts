// FIXME Always try to use the most specific type possible
// FIXME Parse to validate the input and map it to the correct type
// FIXME Never share types between external services and our internal representation - our API needs to be able to evolve independently

type Address = `0x${string}`

type SwapQuoteResponse = {
    fee: {
        amountInUsd: number
        amountInCryptoCurrency: string
        feeToken: Token
    }
    duration: number
    rawTransaction: Transaction
    amountReceived: string
}

type SwapQuoteRequest = {
    fromAddress: Address
    fromTokenAddress: Address
    fromChainId: string
    toTokenAddress: Address
    toChainId: string
    fromAmountWei: string
}

type Transaction = {
    data: string
    to: string
    value: string
    gasPrice: string
    gasLimit: string
    from: string
    chainId: number
}

type Token = {
    address: Address
    chainId: number
    symbol: string
    decimals: number
    name: string
    coinKey: string
    logoURI: string
    priceUSD: string
}
