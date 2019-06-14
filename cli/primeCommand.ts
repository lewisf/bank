import meow from 'meow'
import moment from 'moment'
import inquirer from 'inquirer'
import { NumericDate } from '../types/datetime'

export namespace PrimeCommand {
  interface Answers {
    confirmed: boolean
    date: string
  }

  export function run(cli: meow.Result) {
    inquirer
      .prompt([{
        type: "confirm",
        name: "confirmed",
        message: "This can take awhile. You will be asked to insert that date. Would you like to continue?",
      }, {
        type: "input",
        name: "date",
        message: `Please insert a date in YYYY-MM-DD format`,
        default: moment().format("YYYY-MM-DD"),
        when: (answers) => (answers as { confirmed: boolean }).confirmed
      }])
      .then(answers => {
        if ((answers as Answers).confirmed) {
          const date = NumericDate.make((answers as Answers).date)
          if (NumericDate.isValid(date)) {
            console.log(date.value);
          } else {
            console.log("Format must be YYYY-MM-DD");
          }
        } else {
          console.log("Well, I guess we won't then!")
        }
      })
  }
}