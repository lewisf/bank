/**
 * This is a simple file based key/value store
 * 
 * Provide persistence for tokens that are retrieved
 * from Plaid's authentication endpoints.
 */

import fs from 'fs'
import { sync as mkdirp } from 'mkdirp'
import {
  TOKENS_FILE_PATH,
  PLAID_CONFIG_DIR
} from '../../static/constants'
import { none, fromNullable } from 'fp-ts/lib/Option';

export namespace AccountTokensStore {
  type key = 'PUBLIC_TOKEN' | 'ACCESS_TOKEN' | 'ITEM_ID'
  type value = string

  function ensureJsonFileExists() {
    if (!fs.existsSync(TOKENS_FILE_PATH)) {
      const emptyConfig = {}

      mkdirp(PLAID_CONFIG_DIR)
      fs.writeFileSync(
        TOKENS_FILE_PATH,
        JSON.stringify(emptyConfig, null, 2),
        'utf8'
      );
    }
  }

  export function get(key: key) {
    ensureJsonFileExists()

    const value = require(TOKENS_FILE_PATH)[key]
    return fromNullable(value)
  }

  export function set(key: key, value: value) {
    ensureJsonFileExists()
    const fileContents = require(TOKENS_FILE_PATH);
    fileContents[key] = value;

    fs.writeFileSync(TOKENS_FILE_PATH, JSON.stringify(fileContents, null, 2), 'utf8')

    return value;
  }
}