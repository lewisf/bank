import meow from 'meow'
import open from 'open'

import { AuthenticationApp } from '../auth/app'
import { INIT_NOT_READY } from '../static/strings'
import { PlaidClientProvider } from '../plaid/clientProvider'
import { AccountTokensStore } from '../plaid/credentials/accountTokensStore'
import { MessageSender } from '../notifications/MessageSender';

export namespace InitCommand {
  export function isClientConfigured() {
    return PlaidClientProvider.getClientOpt().isSome()
  }

  export function hasAccessToken() {
    return AccountTokensStore.get("ACCESS_TOKEN").isSome()
  }

  export function run(cli: meow.Result) {
    if (!isClientConfigured()) {
      console.log(INIT_NOT_READY)
    } else if (!hasAccessToken()) {
      const { app } = AuthenticationApp
      const APP_PORT = 3000
      const server = app.listen(APP_PORT, async () => {
        app.on("forceShutdown", () => {
          MessageSender.send({
            title: 'Setup success!',
            message: 'Run `bank sync` next'
          });
          server.close();
        })

        console.log('Opening your browser to setup your bank account.. ')
        console.log('')
        console.log('Automatically opening localhost:' + APP_PORT + ' for your convenience! If it does not open, please visit http://localhost:3000 in your favorite browser')

        await open(`http://localhost:${APP_PORT}`)
      })
    } else {
      console.log(`Already initialized. Try some other commands!

Examples:
    bank transactions
    bank sync
`)
    }
  }
}