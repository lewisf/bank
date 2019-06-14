import fs from 'fs';
import { ConnectionOptions, createConnection, Repository } from 'typeorm'
import { SQLITE3_DB_PATH } from '../static/constants'
import { Account } from './account'
import { Transaction } from './transaction'
import { main } from '../cli';

// @ts-ignore - We guarantee at runtime that this is no longer null
export let AccountsRepo: Repository<Account> = null
// @ts-ignore - We guarantee at runtime that this is no longer null
export let TransactionsRepo: Repository<Transaction> = null

/**
 * This MUST be initialized in order to use the repositories.
 */
export async function init() {
  const options: ConnectionOptions = {
    type: "sqlite",
    database: SQLITE3_DB_PATH,
    entities: [Account, Transaction],
    logging: true,
    synchronize: true
  };

  const connection = await createConnection(options)

  AccountsRepo = connection.getRepository(Account)
  TransactionsRepo = connection.getRepository(Transaction)
}

export const clear = () => {
  fs.unlinkSync(SQLITE3_DB_PATH)
}
