import { CREDENTIALS_FILE_PATH } from "./constants"

export const INIT_NOT_READY = `
Could not find Plaid credentials. Please ensure that you have a file located at ${CREDENTIALS_FILE_PATH} with the following format:

  {
    "clientId": "<PLAID_CLIENT_ID>",
    "secret": "<PLAID_SECRET>",
    "publicKey": "<PLAID_PUBLIC_KEY>"
  }
`