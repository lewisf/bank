import meow from 'meow'
import moment from 'moment'
import inquirer from 'inquirer'
import { NumericDate } from '../types/datetime'
import { TransactionsFetcher } from '../plaid/fetchers/transactionsFetcher';
import { AccountsFetcher } from '../plaid/fetchers/accountsFetcher';
import { count as transactionCount } from '../store/transaction';
import { mark as markSyncRun } from '../store/SyncRun';
import { getLatestRecordedTransactionDate } from '../store/transaction';

export namespace SyncCommand {
  interface Answers {
    confirmed: boolean
    date: string
  }

  export async function run(cli: meow.Result) {
    const latestDate = await getLatestRecordedTransactionDate();

    const answers = await inquirer
      .prompt([{
        type: "confirm",
        name: "confirmed",
        message: "This can take awhile. You will be asked to insert that date. Would you like to continue?",
        when: (_) => latestDate === null
      }, {
        type: "input",
        name: "date",
        message: `Please insert a date in YYYY-MM-DD format`,
        default: moment().format("YYYY-MM-DD"),
        when: (answers) => (answers as { confirmed: boolean }).confirmed
      }])

    if (latestDate === null) {
      if ((answers as Answers).confirmed) {
        const date = NumericDate.make((answers as Answers).date)
        if (NumericDate.isInvalid(date)) {
          console.log("Format must be YYYY-MM-DD")
        } else {
          const accountsFetcher = new AccountsFetcher()
          const [accounts, accountsCount] = await accountsFetcher.run()

          const txnFetcher = new TransactionsFetcher()
          const [transactions, count] = await txnFetcher.run(date.value)

          await markSyncRun();

          console.log(`Loaded ${count} transactions since ${date.value}.`)
          console.log('The next time you run `bank sync` it will', `pick up new transactions since ${date.value}`)
        }
      } else {
        console.log("Well, I guess we won't then!")
      }
    } else {
      const currentCount = await transactionCount()
      const txnFetcher = new TransactionsFetcher()
      const [transactions, count] = await txnFetcher.run(latestDate)

      await markSyncRun();

      console.log(`Loaded ${(count as number) - currentCount} transactions since ${latestDate}.`)
      console.log('The next time you run `bank sync` it will', `pick up new transactions since ${latestDate}`)
    }
  }
}