import { In, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import _ from 'lodash'
import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Account } from './Account'
import { TransactionsRepo } from './db'

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

  @Column({ nullable: true })
  original_description?: string

  @Column()
  name: string

  @Column()
  pending: boolean

  @Column()
  iso_currency_code: string

  @Column({ nullable: true })
  unofficial_currency_code?: string

  @ManyToOne(type => Account, account => account.transactions)
  account: Account
}

/**
 * Get the date of the earliest transaction on file.
 * 
 * For now it's okay to do a stable sort after access rather than DB
 * because the number of transactions is expected to be
 * low enough.
 * 
 * @returns {string} ISO-8601 date
 */
export async function getEarliestTransactionDate() {
  const [latestRecorded] = await TransactionsRepo.find({
    order: {
      date: 'ASC'
    },
    take: 1
  });

  if (latestRecorded) {
    return latestRecorded.date
  }
}

export async function getLatestRecordedTransactionDate() {
  const [latestRecorded] = await TransactionsRepo.find({
    order: {
      date: 'DESC'
    },
    take: 1
  });

  if (latestRecorded) {
    return latestRecorded.date
  } else {
    return null
  }
}

export async function count() {
  return await TransactionsRepo.count();
}

export class TransactionQueryBuilder {
  private accountId: string[] = [];
  private lessThan: number | null = null;
  private moreThan: number | null = null;

  public addAccountId(accountId: string) {
    this.accountId = [...this.accountId, accountId]
  }

  public amountLessThan(value: number) {
    this.lessThan = value;
  }

  public amountMoreThan(value: number) {
    this.moreThan = value;
  }

  get() {
    let {
      accountId,
      moreThan,
      lessThan
    } = this

    let builder = _({})
      .chain()

    if (this.accountId.length > 0) {
      builder = builder
        .set('where.account_id', In(this.accountId))
    }

    if (moreThan !== null && lessThan !== null) {
      builder = builder
        .set('where.amount', Between(moreThan, lessThan))
    } else if (moreThan !== null) {
      builder = builder
        .set('where.amount', MoreThanOrEqual(moreThan))
    } else if (lessThan !== null) {
      builder = builder
        .set('where.amount', LessThanOrEqual(lessThan))
    }

    return builder.value()
  }
}