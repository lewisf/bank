import meow from 'meow'
import { InitCommand } from "./initCommand";
import { TransactionsCommand } from './transactionsCommand';

export const cli = meow(`
  Usage
  $ bank <input>

  Examples
    $ bank init
    $ bank transactions
`)

export function main(command: string, cli: meow.Result) {
  const { isClientConfigured, hasAccessToken } = InitCommand;
  if (command !== 'init' && (!isClientConfigured() || !hasAccessToken())) {
    console.error("`bank` needs to be setup. Please run `bank init' for instructions.");
  }

  switch (command) {
    case "init": InitCommand.run(cli)
    case "transactions": TransactionsCommand.run(cli)
  }
}