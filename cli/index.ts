import meow from 'meow';
import { AccountsCommand } from './accountsCommand';
import { ClearCommand } from './clearCommand';
import { InitCommand } from './initCommand';
import { PrimeCommand } from './primeCommand';
import { TransactionsCommand } from './transactionsCommand';

import { init as initDb } from '../store/db'

export const cli = meow(`
  Usage
  $ bank <input>

  Examples
    $ bank init           -- Initialize accounts
    $ bank clear          -- Clear local database
    $ bank prime          -- Fetch accounts and transactions
    $ bank accounts       -- See accounts
    $ bank transactions   -- See transactions
`)

export async function main(command: string, cli: meow.Result) {
  const { isClientConfigured, hasAccessToken } = InitCommand
  if (command !== 'init' && (!isClientConfigured() || !hasAccessToken())) {
    console.error("`bank` needs to be setup. Please run `bank init' for instructions.")
    return;
  }

  await initDb()

  switch (command) {
    case "init": return InitCommand.run(cli)
    case "clear": return ClearCommand.run(cli)
    case "prime": return PrimeCommand.run(cli)
    case "accounts": return await AccountsCommand.run(cli)
    case "transactions": return await TransactionsCommand.run(cli)
  }
}