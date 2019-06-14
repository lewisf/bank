export interface Message {
  title: string,
  message: string
}

export interface MessageSender {
  send: (message: Message) => Promise<boolean>
}