import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';

/** 프로젝트별 계정 진입 기록. 통합 계정이 어느 프로젝트에 가입했는지 추적한다. */
@Entity({ database: 'db_auth', name: 'tb_auth_project_account' })
export class ProjectAccountEntity {
  @PrimaryColumn({ name: 'project_id', type: 'varchar', length: 255 })
  projectId: string;

  @PrimaryColumn({ name: 'uid', type: 'bigint' })
  uid: number;

  @Column({ name: 'status', type: 'varchar', length: 32, default: 'ACTIVE' })
  status: string;

  @Column({ name: 'last_login_date', type: 'datetime', precision: 6, nullable: true })
  lastLoginDate: Date | null;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
