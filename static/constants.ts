import { homedir } from "os"
import path from "path"

export const PLAID_CONFIG_DIR = path.join(homedir(), ".config/plaid")
export const CREDENTIALS_FILE_PATH = path.join(PLAID_CONFIG_DIR, "credentials.json")
export const TOKENS_FILE_PATH = path.join(PLAID_CONFIG_DIR, "tokens.json")
export const SUPPORTED_COUNTRY_INSTITUTIONS = "US"

/* Configuration constants */
export const PLAID_ENV = "sandbox"