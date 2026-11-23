import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Index('uq_auth_identity_provider_subject', ['provider', 'subject'], { unique: true })
@Entity('auth_identity')
export class AuthIdentity {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: string;
  @Column({ name: 'user_id', type: 'int' }) userId: number;
  @Column({ type: 'enum', enum: ['PHONE_PASSWORD', 'GOOGLE'] }) provider: 'PHONE_PASSWORD' | 'GOOGLE';
  @Column({ type: 'varchar', length: 191 }) subject: string;
  @Column({ name: 'provider_email', type: 'varchar', length: 191, nullable: true }) providerEmail: string | null;
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true, select: false }) passwordHash: string | null;
  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
}
