import meow from 'meow';
import { AccountsCommand } from './AccountsCommand';
import { ClearCommand } from './ClearCommand';
import { ClearDbCommand } from './ClearDbCommand';
import { InitCommand } from './InitCommand';
import { SyncCommand } from './SyncCommand';
import { TransactionsCommand } from './TransactionsCommand';

import { init as initDb } from '../store/db'

export const cli = meow(`
  Usage
  $ bank <input>

  Examples
    $ bank init           -- Initialize accounts
    $ bank clear          -- Clear all
    $ bank cleardb        -- Clear database only
    $ bank sync           -- Fetch accounts and transactions
    $ bank accounts       -- See accounts

  Viewing transactions
    $ bank transactions   
    $ bank transactions --account some_account_id
    $ bank transactions --under 1000 --over 300   
`)

export async function main(command: string, cli: meow.Result) {
  const { isClientConfigured, hasAccessToken } = InitCommand
  if (command !== 'init' && (!isClientConfigured() || !hasAccessToken())) {
    console.error("`bank` needs to be setup. Please run `bank init' for instructions.")
    return;
  }

  if (command !== 'cleardb') {
    await initDb()
  }

  switch (command) {
    case "init": return InitCommand.run(cli)
    case "clear": return ClearCommand.run(cli)
    case "cleardb": return ClearDbCommand.run(cli)
    case "sync": return await SyncCommand.run(cli)
    case "accounts": return await AccountsCommand.run(cli)
    case "transactions": return await TransactionsCommand.run(cli)
  }
}