import inquirer from 'inquirer'
import meow from 'meow'
import { SQLITE3_DB_PATH } from '../static/constants'
import * as db from '../store/db'
import { AccountTokensStore as ATS } from '../plaid/credentials/accountTokensStore'

export namespace ClearDbCommand {
  export function run(cli: meow.Result) {
    inquirer
      .prompt([{
        type: "confirm",
        name: "confirmed",
        message: "Are you sure you want to clear?"
      }])
      .then(answers => {
        if ((answers as { confirmed: boolean }).confirmed) {
          db.clear()
        } else {
          console.log("Phew, that was dangerous.")
        }
      })
  }
}