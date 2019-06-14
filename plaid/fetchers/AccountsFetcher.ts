import _ from 'lodash'
import { BaseFetcher } from './BaseFetcher'
import { Account } from '../../store/account'
import { AccountsRepo } from '../../store/db'

export class AccountsFetcher extends BaseFetcher {
  async run() {
    await this.fetch();
    let [allAccounts, accountsCount] = await AccountsRepo.findAndCount();

    return [allAccounts, accountsCount];
  }

  async fetch() {
    const { client, accessToken } = this
    const { accounts, item, request_id } = await client.getBalance(accessToken)

    return await Promise.all(
      accounts
        .map(async accountFields => {
          let account = new Account();
          Object.assign(account, accountFields, {
            balances: JSON.stringify(accountFields)
          })

          return AccountsRepo.save(account)
        })
    )
  }
}