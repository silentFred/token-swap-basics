'use client'

import axios, { AxiosResponse } from 'axios'
import {
    createWalletClient,
    custom,
    TransactionSerializableEIP1559,
} from 'viem'
import { mainnet } from 'viem/chains'
import { useState } from 'react'

// FIXME IMPROVEMENTS
// - Use standard approach for connecting to wallets and proper connection state management (would also fix TS errors on window object)
// - Add error handling for network requests
// - Handle all nullable/undefined values
// - Add loading state for network requests
// - Load  while changing input fields, debounce and cancel running requests
// - Derive chain ID/ token from API instead of hardcoding, group token-chain pairs for easy selection
// - User friendly number formatting for amounts and fees and use token decimals, symbols, icons for formatting and display
// - Add ability to set maxPriority fee for transaction
// - Show user the details of the underlying transaction before submitting for execution
// - Split components and actions into separate functions and files for better organisation
// - Fix last minute bug discovered for owner address required in quote (change quote button state based on connected wallet)

// Garbage type stubs - to be replaced with alternative wallet connection approach
declare global {
    interface Window {
        ethereum: {
            request: (args: { method: string; params?: [any] }) => Promise<any>
            selectedAddress: string
        }
    }
}

export default function Home() {
    const [fromTokenAddress, setFromTokenAddress] = useState(
        '0x6b175474e89094c44da98b954eedeac495271d0f' // DAI
    )
    const [fromChainId, setFromChainId] = useState(1)
    const [toTokenAddress, setToTokenAddress] = useState(
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' // WBTC
    )
    const [toChainId, setToChainId] = useState(1)
    const [fromAmountWei, setFromAmountWei] = useState('100000000000000000')
    const [quote, setQuote] = useState<SwapQuoteResponse | null>(null)
    const [transactionHash, setTransactionHash] = useState<string | null>(null)

    const [connected, setConnected] = useState(false)
    const [loading, setLoading] = useState(false)
    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-black">
            {loading && <Loader />}
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
                {!connected ? (
                    <button
                        onClick={async () => {
                            setLoading(true)
                            try {
                                const accounts = await window.ethereum.request({
                                    method: 'eth_requestAccounts',
                                })
                                if (accounts.length) {
                                    setConnected(true)
                                }
                            } finally {
                                setLoading(false)
                            }
                        }}
                    >
                        Connect wallet
                    </button>
                ) : null}

                <h1 className="text-2xl font-bold mb-4 text-center">
                    Token Swap
                </h1>
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">
                            From Token Address
                        </label>
                        <input
                            type="text"
                            value={fromTokenAddress}
                            onChange={(e) =>
                                setFromTokenAddress(e.target.value)
                            }
                            className="input input-bordered w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">
                            From Chain ID
                        </label>
                        <input
                            type="number"
                            value={fromChainId}
                            onChange={(e) =>
                                setFromChainId(Number(e.target.value))
                            }
                            className="input input-bordered w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">
                            To Token Address
                        </label>
                        <input
                            type="text"
                            value={toTokenAddress}
                            onChange={(e) => setToTokenAddress(e.target.value)}
                            className="input input-bordered w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">
                            To Chain ID
                        </label>
                        <input
                            type="number"
                            value={toChainId}
                            onChange={(e) =>
                                setToChainId(Number(e.target.value))
                            }
                            className="input input-bordered w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">
                            From Amount (Wei)
                        </label>
                        <input
                            type="text"
                            value={fromAmountWei}
                            onChange={(e) => setFromAmountWei(e.target.value)}
                            className="input input-bordered w-full p-2 border rounded"
                        />
                    </div>
                </div>

                <Quote quote={quote} />

                <div className="mt-6 flex space-x-4">
                    <button
                        onClick={async () => {
                            setLoading(true)
                            try {
                                const quoteResponse: AxiosResponse<SwapQuoteResponse> =
                                    await axios.post('/api/quote', {
                                        fromAddress:
                                            window.ethereum.selectedAddress,
                                        fromTokenAddress: fromTokenAddress,
                                        fromChainId: fromChainId,
                                        toTokenAddress: toTokenAddress,
                                        toChainId: toChainId,
                                        fromAmountWei: fromAmountWei,
                                    })

                                setQuote(quoteResponse.data)
                            } finally {
                                setLoading(false)
                            }
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Get Quote
                    </button>

                    {connected && quote && (
                        <button
                            onClick={async () => {
                                if (!quote) {
                                    alert(
                                        'No quote found. Please get a quote first.'
                                    )
                                    return
                                }

                                const client = createWalletClient({
                                    chain: mainnet,
                                    transport: custom(window.ethereum!),
                                })

                                const rawTransaction = quote.rawTransaction
                                setLoading(true)
                                const request =
                                    (await client.prepareTransactionRequest({
                                        to: rawTransaction.to,
                                        data: rawTransaction.data as `0x${string}`,
                                        account:
                                            window.ethereum.selectedAddress,
                                    })) as TransactionSerializableEIP1559

                                if (
                                    !request.gas ||
                                    !request.maxFeePerGas ||
                                    !request.maxPriorityFeePerGas
                                ) {
                                    alert(
                                        'Error preparing transaction: gas properties missing'
                                    )
                                    return
                                }

                                let mmRequest = {
                                    to: request.to,
                                    from: window.ethereum.selectedAddress,
                                    gas: '0x' + request.gas.toString(16),
                                    value: '0x' + 0n.toString(16),
                                    data: request.data,
                                    maxPriorityFeePerGas:
                                        '0x' +
                                        request.maxPriorityFeePerGas.toString(
                                            16
                                        ),
                                    maxFeePerGas:
                                        '0x' +
                                        request.maxFeePerGas.toString(16),
                                }
                                try {
                                    const hash = await window.ethereum.request({
                                        method: 'eth_sendTransaction',
                                        params: [mmRequest],
                                    })
                                    setTransactionHash(hash)
                                } finally {
                                    setLoading(false)
                                }
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Execute Swap
                        </button>
                    )}

                    {!(connected && quote) && (
                        <span>
                            Connect wallet and get a quote to execute swap
                        </span>
                    )}
                </div>
                <EtherScanLink transactionHash={transactionHash} />
            </div>
        </main>
    )
}

function Quote({ quote }: { quote: SwapQuoteResponse | null }) {
    if (!quote) {
        return null
    }
    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Quote</h2>
            <div className="p-4 bg-gray-100 rounded">
                <p>
                    Transaction duration:{' '}
                    {quote?.duration + ' seconds' || 'N/A'}
                </p>
                <p>
                    Transaction fee: {quote?.fee.amountInUsd + ' USD' || 'N/A'}
                </p>
                <p>
                    Tokens received:{' '}
                    {quote
                        ? (Number(quote.amountReceived) / 10 ** 8).toFixed(8) +
                          ' ' +
                          quote.fee.feeToken.symbol
                        : 'N/A'}
                </p>
            </div>
        </div>
    )
}

function EtherScanLink({
    transactionHash,
}: {
    transactionHash: string | null
}) {
    if (!transactionHash) {
        return null
    }
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-black">
                Transaction Complete
            </h3>
            <a
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
            >
                View on Etherscan
            </a>
        </div>
    )
}

function Loader() {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-lg">Loading...</div>
        </div>
    )
}
