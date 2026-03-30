import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from '@libs/database';

@Entity({ database: 'db_auth', name: 'tb_auth_account' })
export class AccountEntity {
  /** 내부 PK. 다른 테이블의 FK로 사용되며 외부에 노출하지 않는다. */
  @PrimaryGeneratedColumn({ name: 'uid', type: 'bigint' })
  uid: number;

  /** JWT sub에 사용되는 외부 식별자. */
  @Column({ name: 'uuid', type: 'varchar', length: 64, unique: true })
  uuid: string;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
