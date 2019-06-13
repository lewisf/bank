import { ItemResponse, TokenResponse, AuthResponse, TransactionsResponse, TransactionsRequestOptions } from 'plaid'
import plaid from "plaid"
import { PlaidCredentialsFileProvider } from "./credentials/plaidServiceCredentialsProvider"
import { Option, some, none } from "fp-ts/lib/Option"

interface PlaidCredentials {
  clientId: string,
  secret: string,
  publicKey: string
}

interface DenodeifiedPlaidClient {
  exchangePublicToken: (publicToken: string) => Promise<TokenResponse>,
  getItem: (accessToken: string) => Promise<ItemResponse>,
  getAuth: (accessToken: string) => Promise<AuthResponse>,
  getTransactions: (accessToken: string, startDate: string, endDate: string, options?: TransactionsRequestOptions) => Promise<TransactionsResponse>
}

export namespace PlaidClientProvider {
  let clientSingleton: plaid.Client | null = null;
  let credentialsSingleton: PlaidCredentials | null = null;

  export function getCredentialsOpt() {
    if (credentialsSingleton) {
      return some(credentialsSingleton);
    }

    const provider = new PlaidCredentialsFileProvider();
    provider.initialize();

    return provider.validate()
      .map(validCredentials => {
        // Storing in singleton
        credentialsSingleton = validCredentials
        return validCredentials;
      });
  }

  export function getCredentials() {
    const opt = getCredentialsOpt();
    if (opt.isNone()) {
      throw new Error("Failed to load Plaid credentials");
    }

    return opt.value;
  }

  function denodeifyClient(client: plaid.Client): DenodeifiedPlaidClient {
    return {
      exchangePublicToken: (publicToken: string): Promise<TokenResponse> =>
        new Promise((resolve, reject) => {
          client.exchangePublicToken(publicToken, (error, tokenResponse) => {
            if (error !== null) { reject(error) }
            resolve(tokenResponse)
          })
        }),
      getItem: (accessToken: string): Promise<ItemResponse> =>
        new Promise((resolve, reject) => {
          client.getItem(accessToken, (error, itemResponse) => {
            if (error !== null) { reject(error) }
            resolve(itemResponse)
          })
        }),
      getAuth: (accessToken: string): Promise<AuthResponse> =>
        new Promise((resolve, reject) => {
          client.getAuth(accessToken, (error, authResponse) => {
            if (error !== null) { reject(error) }
            resolve(authResponse)
          })
        }),
      getTransactions: (accessToken: string, startDate: string, endDate: string, options?: TransactionsRequestOptions): Promise<TransactionsResponse> =>
        new Promise((resolve, reject) => {
          if (options) {
            client.getTransactions(accessToken, startDate, endDate, options, (error, transactionsResponse) => {
              if (error !== null) { reject(error) }
              resolve(transactionsResponse);
            });
          } else {
            client.getTransactions(accessToken, startDate, endDate, (error, transactionsResponse) => {
              if (error !== null) { reject(error) }
              resolve(transactionsResponse);
            });
          }
        })
    }
  }

  export function getClient(): Option<DenodeifiedPlaidClient> {
    if (clientSingleton) {
      return some(clientSingleton)
        .map(denodeifyClient)
    }

    return getCredentialsOpt()
      .map(credentials => {
        clientSingleton = new plaid.Client(
          credentials.clientId,
          credentials.secret,
          credentials.publicKey,
          plaid.environments.sandbox,
          { version: "2019-05-29" }
        );

        return getClient();
      })
      .getOrElseL(() => { return none; });
  }
}