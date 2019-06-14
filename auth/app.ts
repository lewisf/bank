import bodyParser from 'body-parser'
import moment from 'moment'
import express from 'express'
import path from 'path'
import util from 'util'
import { Option } from 'fp-ts/lib/Option'

import { PlaidClientProvider } from '../plaid/clientProvider'
import { AccountTokensStore as ATS } from '../plaid/credentials/accountTokensStore'
import { SUPPORTED_COUNTRY_INSTITUTIONS } from '../static/constants'

export namespace AuthenticationApp {
  const clientOpt = PlaidClientProvider.getClientOpt()
  if (clientOpt.isNone()) {
    throw new Error('Application is misconfigured. Please ensure Plaid credentials are provided.')
  }

  const client = clientOpt.value

  export const app = express()
  app.use(express.static(path.join(__dirname, 'public')))
  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, 'views'))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.get('/', (request, response, next) => {
    const credentials = PlaidClientProvider.getCredentials()

    response.render('index.ejs', {
      PLAID_PUBLIC_KEY: credentials.publicKey,
      PLAID_ENV: 'sandbox',
      PLAID_PRODUCTS: 'transactions',
      PLAID_COUNTRY_CODES: SUPPORTED_COUNTRY_INSTITUTIONS
    })
  })

  app.post('/get_access_token', async (request, response, next) => {
    if (!request.body.public_token) { throw new Error("Missing required PUBLIC_TOKEN") }
    const publicToken = ATS.set("PUBLIC_TOKEN", request.body.public_token)

    try {
      const tokenResponse = await client.exchangePublicToken(publicToken)
      const { access_token, item_id } = tokenResponse

      const accessToken = ATS.set("ACCESS_TOKEN", access_token)
      const itemId = ATS.set("ITEM_ID", item_id)

      prettyPrintResponse(tokenResponse)

      console.log("")
      console.log("Success! Try running `bank prime` next to prime transactions")

      setTimeout(() => {
        app.emit("forceShutdown")
      }, 0)

      return response.json({
        access_token: accessToken,
        item_id: itemId,
        error: null,
      })
    } catch (error) {
      prettyPrintResponse(error)
      return response.json({ error: error })
    }
  })

  app.post('/set_access_token', async (request, response, next) => {
    const accessToken = ATS.get("ACCESS_TOKEN")
    if (accessToken.isNone()) {
      throw new Error("Missing ACCESS_TOKEN")
    }

    const { item: { item_id } } = await client.getItem(accessToken.value)
    return response.json({
      item_id,
      error: false,
    })
  })

  // Retrieve ACH or ETF Auth data for an Item's accounts
  // https://plaid.com/docs/#auth
  app.get('/auth', async (request, response, next) => {
    const accessToken: Option<string> = ATS.get("ACCESS_TOKEN")

    if (accessToken.isNone()) {
      throw new Error("Missing ACCESS_TOKEN")
    }

    try {
      const authResponse: object = await client.getAuth(accessToken.value)
      prettyPrintResponse(authResponse)
      return response.json({ error: null, auth: authResponse })
    } catch (error) {
      prettyPrintResponse(error)
      return response.json({ error: error })
    }
  })

  // Retrieve Transactions for an Item
  // https://plaid.com/docs/#transactions
  app.get('/transactions', async (request, response, next) => {
    // Pull transactions for the Item for the last 30 days
    const accessToken: Option<string> = ATS.get("ACCESS_TOKEN")
    if (accessToken.isNone()) { throw new Error("Missing access token") }

    var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
    var endDate = moment().format('YYYY-MM-DD')

    try {
      const transactionsResponse = await client.getTransactions(
        accessToken.value,
        startDate,
        // @ts-ignore
        endDate, {
          count: 250,
          offset: 0,
        }
      )

      prettyPrintResponse(transactionsResponse)
      return response.json({ error: null, transactions: transactionsResponse })
    } catch (error) {
      prettyPrintResponse(error)
      return response.json({ error: error })
    }
  })

  const prettyPrintResponse = (response: object) => {
    return;
    // console.log(util.inspect(response, { colors: true, depth: 4 }))
  }
}