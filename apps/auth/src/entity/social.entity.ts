import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';

/** 소셜 계정 전역 테이블. 프로젝트 무관하게 (provider, social_id) → uuid 매핑을 관리한다. */
@Entity({ database: 'db_auth', name: 'tb_auth_social' })
export class SocialEntity {
  @PrimaryColumn({ name: 'provider', type: 'varchar', length: 64 })
  provider: string;

  @PrimaryColumn({ name: 'social_id', type: 'varchar', length: 255 })
  socialId: string;

  /** account 테이블의 uuid. 다른 소셜 계정과의 링킹 키. */
  @Column({ name: 'uuid', type: 'varchar', length: 64 })
  uuid: string;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
