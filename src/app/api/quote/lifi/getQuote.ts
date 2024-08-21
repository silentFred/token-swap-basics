import axios, { AxiosResponse } from 'axios'
import { parseLifiQuoteResponse } from './parseLifiQuoteResponse'

const LIFI_API_BASE_USR = 'https://li.quest/v1'

// FIXME handle errors
export const getQuote = async (
    lifiQuoteRequest: LifiQuoteRequest
): Promise<LifiQuoteResponse> => {
    const result: AxiosResponse<LifiQuoteResponse> = await axios.get(
        `${LIFI_API_BASE_USR}/quote`,
        {
            params: lifiQuoteRequest,
        }
    )
    return parseLifiQuoteResponse(result.data)
}
