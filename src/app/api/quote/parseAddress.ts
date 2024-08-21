// use isAddress + getAddress from viem instead
export const parseAddress = (address: string): Address => {
    if (!address.match(/^0x[0-9a-fA-F]{40}$/)) {
        throw new Error(`Invalid address: ${address}`)
    }
    return address as Address
}
