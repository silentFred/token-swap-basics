import { parseAddress } from '@/app/api/quote/parseAddress'
import { describe, it, expect } from '@jest/globals'

describe('Address Parser', () => {
    it('should parse a valid EVM address', () => {
        const address = '0x61584c1069fae02aaef0c0163e63613bfa78751b'
        expect(parseAddress(address)).toEqual(address)
    })

    it('should throw an error for an address shorter than 40 characters', () => {
        const invalidAddress = '0x1234567890'
        expect(() => parseAddress(invalidAddress)).toThrow(
            `Invalid address: ${invalidAddress}`
        )
    })

    it('should throw an error for an address longer than 40 characters', () => {
        const invalidAddress =
            '0x1234567890123456789012345678901234567890123456'
        expect(() => parseAddress(invalidAddress)).toThrow(
            `Invalid address: ${invalidAddress}`
        )
    })

    it('should throw an error for an address with invalid characters', () => {
        const invalidAddress = '0x1234567890GHIJKLmnopqrstuvwx1234567890ABCD'
        expect(() => parseAddress(invalidAddress)).toThrow(
            `Invalid address: ${invalidAddress}`
        )
    })

    it('should correctly parse a valid address with uppercase letters', () => {
        const address = '0xABCD1234567890abcdEF1234567890abcdEF1234'
        expect(parseAddress(address)).toEqual(address)
    })

    it('should throw an error if the address does not start with 0x', () => {
        const invalidAddress = '1234567890123456789012345678901234567890'
        expect(() => parseAddress(invalidAddress)).toThrow(
            `Invalid address: ${invalidAddress}`
        )
    })

    it('should throw an error if an empty string is passed', () => {
        const invalidAddress = ''
        expect(() => parseAddress(invalidAddress)).toThrow(
            `Invalid address: ${invalidAddress}`
        )
    })
})
