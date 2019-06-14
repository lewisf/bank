import inquirer from 'inquirer'
import meow from 'meow'
import * as db from '../store/db'
import { AccountTokensStore as ATS } from '../plaid/credentials/accountTokensStore'

export namespace ClearCommand {
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
          ATS.clear()
        } else {
          console.log("Phew, that was dangerous.")
        }
      })
  }
}