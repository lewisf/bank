/**
 * PlaidCredentialsProviders
 * 
 * Get credentials from different sources. 
 * 
 * const provider = await (new PlaidCredentialsFileProvider()).initialize()
 * const credentials = provider.validate()
 */
import fs from "fs"
import _ from "lodash"
import { Option, some, none } from "fp-ts/lib/Option"
import { INIT_NOT_READY } from "../../static/messages"
import { CREDENTIALS_FILE_PATH } from "../../static/constants"

interface PlaidCredentials {
  clientId: string
  secret: string
  publicKey: string
}

interface PlaidServiceCredentialsProviderI {
  initialize: () => void
  validate: () => Option<PlaidCredentials>
}

class BasePlaidServiceCredentialsProvider implements PlaidServiceCredentialsProviderI {
  protected clientId: string | null = null
  protected secret: string | null = null
  protected publicKey: string | null = null

  /**
   * When implementing initialize, it's preferred to use synchronous / blocking
   * calls. This application cannot function without credentials anyway
   * 
   * If an asynchronous operation to load credentials, use the `deasync` package
   * to turn it into a synchronous + blocking operation.
   */
  public initialize() {
    throw new Error("Override this upon implementation")
  }

  validate(): Option<PlaidCredentials> {
    return (this.clientId && this.secret && this.publicKey) ?
      some({
        clientId: this.clientId,
        secret: this.secret,
        publicKey: this.publicKey
      }) :
      none
  }
}

export class PlaidCredentialsFileProvider
  extends BasePlaidServiceCredentialsProvider
  implements PlaidServiceCredentialsProviderI {

  public initialize() {
    const credentialsFileExists = fs.existsSync(CREDENTIALS_FILE_PATH);
    if (!credentialsFileExists) {
      throw new Error(INIT_NOT_READY);
    }

    const credentials = require(CREDENTIALS_FILE_PATH)

    this.clientId = credentials.clientId
    this.secret = credentials.secret
    this.publicKey = credentials.publicKey
  }
}