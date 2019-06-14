import meow from 'meow'
import moment from 'moment'
import inquirer from 'inquirer'
import { SyncRunsRepo } from '../store/db'
import { NumericDate } from '../types/datetime'
import { TransactionsFetcher } from '../plaid/fetchers/transactionsFetcher';
import { AccountsFetcher } from '../plaid/fetchers/accountsFetcher';
import { SyncRun, mark as markSyncRun } from '../store/SyncRun';

export namespace SyncCommand {
  interface Answers {
    confirmed: boolean
    date: string
  }

  async function getEarliestStoredDate() {
  }

  export async function run(cli: meow.Result) {
    const answers = await inquirer
      .prompt([{
        type: "confirm",
        name: "confirmed",
        message: "This can take awhile. You will be asked to insert that date. Would you like to continue?",
      }, {
        type: "input",
        name: "date",
        message: `Please insert a date in YYYY-MM-DD format`,
        default: moment().format("YYYY-MM-DD"),
        when: (answers) => (answers as { confirmed: boolean }).confirmed
      }])

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
      }
    } else {
      console.log("Well, I guess we won't then!")
    }
  }
}