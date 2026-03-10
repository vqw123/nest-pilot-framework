import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';

/**
 * 프로젝트별 소셜 바인딩 테이블.
 * 어떤 프로젝트에 어떤 소셜 계정이 등록되어 있는지 추적한다.
 * 서비스 탈퇴 시 해당 row 삭제 → 남은 binding이 없으면 계정 완전 삭제.
 */
@Entity({ database: 'db_auth', name: 'tb_auth_social_binding' })
export class SocialBindingEntity {
  @PrimaryColumn({ name: 'project_id', type: 'varchar', length: 255 })
  projectId: string;

  @PrimaryColumn({ name: 'provider', type: 'varchar', length: 64 })
  provider: string;

  @PrimaryColumn({ name: 'social_id', type: 'varchar', length: 255 })
  socialId: string;

  @Column({ name: 'uuid', type: 'varchar', length: 64 })
  uuid: string;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
