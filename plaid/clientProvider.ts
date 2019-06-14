import plaid from "plaid"
import { PlaidCredentialsFileProvider } from "./credentials/plaidServiceCredentialsProvider"
import { Option, some, none } from "fp-ts/lib/Option"

interface PlaidCredentials {
  clientId: string,
  secret: string,
  publicKey: string
}

export namespace PlaidClientProvider {
  let clientSingleton: plaid.Client | null = null
  let credentialsSingleton: PlaidCredentials | null = null

  export function getCredentialsOpt() {
    if (credentialsSingleton) {
      return some(credentialsSingleton)
    }

    const provider = new PlaidCredentialsFileProvider()
    provider.initialize()

    return provider.validate()
      .map(validCredentials => {
        // Storing in singleton
        credentialsSingleton = validCredentials
        return validCredentials
      })
  }

  export function getCredentials() {
    const opt = getCredentialsOpt()
    if (opt.isNone()) {
      throw new Error("Failed to load Plaid credentials")
    }

    return opt.value
  }

  export function getClientOpt(): Option<plaid.Client> {
    if (clientSingleton) {
      return some(clientSingleton)
    }

    return getCredentialsOpt()
      .map(credentials => {
        clientSingleton = new plaid.Client(
          credentials.clientId,
          credentials.secret,
          credentials.publicKey,
          plaid.environments.sandbox,
          { version: "2019-05-29" }
        )

        return getClientOpt()
      })
      .getOrElseL(() => { return none })
  }

  export function getClient(): plaid.Client {
    const clientOpt = getClientOpt()
    if (clientOpt.isNone()) { throw new Error("Failed to get client!") }

    return clientOpt.value
  }
}