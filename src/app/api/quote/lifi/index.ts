type LifiQuoteResponse = {
    estimate: {
        toAmountMin: string
        executionDuration: number
        gasCosts: [
            {
                amountUSD: number
                amount: string
                token: Token
                // even though not used, demonstrating that it's NB to always work with known types/ enums
                type: 'SUM' | 'APPROVE' | 'SEND'
            },
        ]
        approvalAddress: Address
    }
    transactionRequest: Transaction
}

type LifiQuoteRequest = {
    fromChain: string
    toChain: string
    fromToken: string
    toToken: string
    fromAmount: string
    fromAddress: Address
}
