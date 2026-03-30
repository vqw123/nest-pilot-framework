import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';

@Entity({ database: 'db_auth', name: 'tb_auth_email_identity' })
export class EmailIdentityEntity {
  @PrimaryColumn({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  /** account 테이블의 uid. 통합 계정 내부 식별자. */
  @Column({ name: 'uid', type: 'bigint' })
  uid: number;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'verified', type: 'tinyint', default: 0 })
  verified: boolean;

  @Column({ name: 'verification_code', type: 'varchar', length: 16, nullable: true })
  verificationCode: string | null;

  @Column({ name: 'verification_expire_date', type: 'timestamp', nullable: true })
  verificationExpireDate: Date | null;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
