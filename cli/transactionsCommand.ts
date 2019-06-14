import _ from 'lodash';
import meow from 'meow';
import Table from 'cli-table';
import { TransactionsRepo } from '../store/db';
import { AccountsRepo } from '../store/db';
import { Account } from '../store/Account';
import { TransactionQueryBuilder } from '../store/Transaction';
import { MessageSender } from '../notifications/MessageSender';

const ISO8601_FORMAT = "YYYY-MM-DD";

export namespace TransactionsCommand {
  const getAccountName = (accounts: Account[], accountId: string) => {
    const name = _(accounts)
      .chain()
      .find(acc => acc.account_id === accountId)
      .get("name")
      .value();
    return name;
  }

  export async function run(cli: meow.Result) {
    const { flags: { account, over, under } } = cli;

    const accounts = await AccountsRepo.find()

    const builder = new TransactionQueryBuilder()
    if (account) {
      account.split(',')
        .forEach((accountId: string) => {
          builder.addAccountId(accountId)
        })
    }
    if (over) { builder.amountMoreThan(over) }
    if (under) { builder.amountLessThan(under) }

    const query = builder.get()

    const transactions =
      await TransactionsRepo.find(query)

    const table = new Table({
      head: ["date", "account", "name", "amount"],
      colWidths: [12, 20, 50, 10]
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

    MessageSender.send({
      title: "Query successful",
      message: `Found ${transactions.length} transactions`,
    })

    console.log(table.toString());

    // Until node-notifier is fixed upstream
    process.exit(0)
  }
}