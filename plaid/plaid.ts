/**
 * A focused wrapper around plaid-node to make fetching easier.
 */

import { NumericDate } from "../types/datetime"

class TransactionsFetcher {
  // Fetch sequentially backwards from todays date.
  async dateRange(
    startDate: NumericDate.t,
    endDate: NumericDate.t
  ) {
    if (NumericDate.isInvalid(startDate)) {
      throw new Error("Start date must be of format YYYY-MM-DD")
    }

    if (NumericDate.isInvalid(endDate)) {
      throw new Error("End date must be of format YYYY-MM-DD")
    }
  }
}