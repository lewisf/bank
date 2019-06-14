import _ from 'lodash';
import Table from 'cli-table';
import meow from 'meow';

import { AccountTokensStore } from '../plaid/credentials/accountTokensStore';
import { PlaidClientProvider } from '../plaid/clientProvider';
import { AccountsFetcher } from '../plaid/fetchers/AccountsFetcher';
import { Account } from '../store/account';

export namespace AccountsCommand {
  export async function run(cli: meow.Result) {
    const client = PlaidClientProvider.getClient()
    const accessToken: string = AccountTokensStore.getOrError('ACCESS_TOKEN')

    const table = new Table({
      head: ['mask', 'id', 'type', 'subtype', 'name'],
      colWidths: [10, 40, 10, 20, 30]
    });

    const fetcher = new AccountsFetcher()
    const [accounts, accountsCount] = await fetcher.run() as [Account[], number]

    _(accounts).each(({
      mask,
      account_id,
      type,
      subtype,
      name
    }) => {
      table.push([
        mask,
        account_id,
        type,
        subtype,
        name
      ])
    })

    console.log(table.toString());
  }
}