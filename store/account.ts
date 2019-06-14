import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from './Transaction'

@Entity()
export class Account {
  @PrimaryColumn()
  account_id: string

  @Column()
  balances: string

  @Column()
  mask: string

  @Column()
  name: string

  @Column({ nullable: true })
  official_name?: string

  @Column()
  subtype: string

  @Column()
  type: string

  @OneToMany(type => Transaction, transaction => transaction.account)
  transactions: Transaction[]
}