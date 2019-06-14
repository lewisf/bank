import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Account } from './account'

@Entity()
export class Transaction {
  @PrimaryColumn()
  transaction_id: string

  @Column()
  account_id: string

  @Column()
  amount: number

  @Column()
  date: string

  @Column()
  original_description: string

  @Column()
  pending: boolean

  @Column()
  iso_currency_code: string

  @Column()
  unofficial_currency_code?: string

  @ManyToOne(type => Account, account => account.transactions)
  account: Account
}