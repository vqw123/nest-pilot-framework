import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from '@libs/database';

@Entity({ database: 'db_auth', name: 'tb_auth_account' })
export class AccountEntity {
  /** JWT sub에 사용되는 외부 식별자 */
  @PrimaryGeneratedColumn({ name: 'uid', type: 'bigint' })
  uid: number;

  /** 소셜 계정 간 연동을 위한 내부 링킹 키 */
  @Column({ name: 'uuid', type: 'varchar', length: 64, unique: true })
  uuid: string;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
