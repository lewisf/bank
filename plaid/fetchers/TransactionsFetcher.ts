import moment from 'moment'
import { Client, Transaction as PlaidTransaction } from 'plaid'
import { BaseFetcher } from './BaseFetcher'
import { TransactionsRepo } from '../../store/db'
import { Transaction } from '../../store/transaction'

const DEFAULT_OPTIONS = {
  count: 500,
  offset: 0
}

const END_DATE = moment().format("YYYY-MM-DD")

export class TransactionsFetcher extends BaseFetcher {
  async run(startDate: string, endDate: string = END_DATE) {
    let done = false;
    let fetchedCount = 0;
    let targetCount = null;

    console.log("Starting fetch")
    while (!done) {
      const [transactions, total] = await this.fetch(
        startDate,
        endDate,
        fetchedCount,
      ) as [Transaction[], number];

      fetchedCount = fetchedCount + transactions.length;
      targetCount = total;

      if (fetchedCount === targetCount) {
        done = true;
      }
    }

    let [allTransactions, transactionsCount] = await TransactionsRepo.findAndCount();
    return [allTransactions, transactionsCount];
  }

  async fetch(
    startDate: string,
    endDate: string,
    fetchedCount: number,
  ) {
    const { client, accessToken } = this

    const {
      transactions: plaidTransactions,
      total_transactions: totalTransactions,
    } = await client.getTransactions(
      accessToken,
      startDate,
      endDate,
      { ...DEFAULT_OPTIONS, offset: fetchedCount }
    )

    const transactions = await Promise.all(
      plaidTransactions
        .map(async (fields: PlaidTransaction) => {
          let transaction = new Transaction();
          Object.assign(transaction, fields);

          return TransactionsRepo.save(transaction)
        })
    )

    return [transactions, totalTransactions];
  }
}