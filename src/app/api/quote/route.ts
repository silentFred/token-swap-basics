import { NextResponse } from 'next/server'
import { getQuote } from '@/app/api/quote/lifi/getQuote'

// FIXME IMPROVEMENTS
// Would use fastify for more control, readability and less framework bloat.
// Change API route to /api/exchange/quote
// More tests (unit, integration - depending on where we get most ROI)
// Handle no supported routes and API/http errors
// Handle multiple quotes from source and adjust our API contract
// Parse and validate all incoming data from client and 3rd party APIs
// Add error handling, logging, tracing, monitoring and alerting
// Add fallback providers (if our primary fails) like bungee etc. aggregators and map their responses to our API contract
// Ensure our contract allows us to map any provider's quote and meta-data to our API contract (includes token and chain metadata)
// Explore opportunities for caching viable routes for a short period of time
// Spawn multiple node instances (PM2 in cluster mode and/or Kubernetes/ loadbalancer etc.) to scale
// Add sensible rate limiting, throttling
// Basic form of auth
// Add WAF
//
//

export async function POST(request: Request) {
    const swapRequest: SwapQuoteRequest = await request.json()

    const quoteResponse = await getQuote({
        fromAddress: swapRequest.fromAddress,
        fromAmount: swapRequest.fromAmountWei,
        fromChain: swapRequest.fromChainId,
        fromToken: swapRequest.fromTokenAddress,
        toChain: swapRequest.toChainId,
        toToken: swapRequest.toTokenAddress,
    })

    // prefetch matrix of vialble chain + tokens for ui
    // inspect the payload and respond with particular http code + sensible error code + friendly description

    // FIXME IMPROVEMENTS - could give user the option to choose instead
    let gasCosts = quoteResponse.estimate.gasCosts.reduce((prev, curr) => {
        return curr.amountUSD < prev.amountUSD ? curr : prev
    }, quoteResponse.estimate.gasCosts[0])

    const response: SwapQuoteResponse = {
        amountReceived: quoteResponse.estimate.toAmountMin,
        duration: quoteResponse.estimate.executionDuration,
        fee: {
            amountInUsd: gasCosts.amountUSD,
            amountInCryptoCurrency: gasCosts.amount,
            feeToken: gasCosts.token,
        },
        rawTransaction: quoteResponse.transactionRequest,
    }

    return NextResponse.json(response)
}
