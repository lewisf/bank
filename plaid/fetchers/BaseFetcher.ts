import { Client } from "plaid";
import { PlaidClientProvider } from '../clientProvider'
import { AccountTokensStore } from '../credentials/accountTokensStore'

export class BaseFetcher {
  protected client: Client;
  protected accessToken: string;

  constructor() {
    this.client = PlaidClientProvider.getClient()
    this.accessToken = AccountTokensStore.getOrError('ACCESS_TOKEN')
  }
}