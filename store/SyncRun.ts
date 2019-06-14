import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { SyncRunsRepo } from './db'

@Entity()
export class SyncRun {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

export async function mark() {
  const syncRun = new SyncRun()
  return await SyncRunsRepo.save(syncRun)
}

export async function getMostRecentDate() {
  const syncRun = await SyncRunsRepo.find({
    order: {
      createdAt: "DESC"
    },
    take: 1
  })

  return syncRun;
}