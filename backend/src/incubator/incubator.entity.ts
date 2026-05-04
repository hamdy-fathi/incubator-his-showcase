import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('incubator_data')
export class IncubatorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  temperature: number;

  @Column({ type: 'int' })
  humidity: number;

  @CreateDateColumn()
  timestamp: Date;
}
