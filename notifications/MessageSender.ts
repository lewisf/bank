import { singleton as SystemMessageSender } from "./SystemMessageSender";

// TODO: Add more senders here like EmailSender
// when they get enabled.
export const MessageSender = SystemMessageSender;