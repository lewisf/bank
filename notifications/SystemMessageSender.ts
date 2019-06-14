import { Message, MessageSender } from './types'
import notifier from 'node-notifier'

const DEFAULT_OPTIONS = {
  wait: true,
  sound: false,
  timeout: 0
}

export class SystemMessageSender implements MessageSender {
  public async send(message: Message) {
    return new Promise((resolve, reject) => {
      notifier.notify({
        ...message,
        ...DEFAULT_OPTIONS
      }, (err, res) => {
        resolve(err ? false : true)
      })
    }) as Promise<boolean>
  }
}

export const singleton = new SystemMessageSender()