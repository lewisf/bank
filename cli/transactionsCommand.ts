import _ from 'lodash';
import meow from 'meow';
import moment, { ISO_8601 } from 'moment';
import Table from 'cli-table';
import { NumericDate as ND } from '../types/datetime';
import { AccountTokensStore } from '../plaid/credentials/accountTokensStore';
import { PlaidClientProvider } from '../plaid/clientProvider';
import { Transaction, Account, TransactionsRequestOptions } from 'plaid';

const ISO8601_FORMAT = "YYYY-MM-DD";

export namespace TransactionsCommand {
  const getAccountName = (accounts: Account[], accountId: string) => {
    return _(accounts)
      .chain()
      .find(acc => acc.account_id === accountId)
      .get("name")
      .value();
  }

  export async function run(cli: meow.Result) {
    const client = PlaidClientProvider.getClient()
    const accessToken: string = AccountTokensStore.getOrError("ACCESS_TOKEN")

    const { from, account, accounts: accountsFlag } = cli.flags

    const numericEndDate = ND.make(from)
    const endDate = ND.isValid(numericEndDate) ? moment(numericEndDate.value) : moment()
    const startDate = moment(endDate).subtract(30, 'days')

    const options: TransactionsRequestOptions = {
      count: 20,
      offset: 0,
      // @ts-ignore
      account_ids: null
    }

    if (accountsFlag) {
      options.account_ids = accountsFlag.split(',');
    } else if (account) {
      options.account_ids = [account as string]
    }

    const {
      transactions,
      accounts,
      total_transactions: totalTransactions
    } = await client.getTransactions(
      accessToken,
      startDate.format(ISO8601_FORMAT),
      endDate.format(ISO8601_FORMAT),
      options
    )

    const table = new Table({
      head: ["date", "account", "name", "amount"],
      colWidths: [12, 20, 50, 10],
      style: { 'padding-left': 0, 'padding-right': 0 }
    });

    _(transactions)
      .each(({ date, account_id, name, amount }) => {
        table.push([
          date,
          getAccountName(accounts, account_id),
          name,
          (amount as number).toFixed(2)
        ])
      })

    console.log(table.toString());

    if (transactions.length > 0) {
      const lastTxn = _(transactions).last() as Transaction;
      const flags = [
        "--from", lastTxn.date
      ];

      if (account) {
        flags.push("--account");
        flags.push(`"${account}"`);
      }

      console.log(`Next: bank transactions ${flags.join(" ")}`)
    }
  }
}