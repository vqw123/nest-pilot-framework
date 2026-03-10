import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';

/** 소셜 프로필 정보. provider마다 제공 필드가 달라 JSON으로 유연하게 관리한다. */
@Entity({ database: 'db_auth', name: 'tb_auth_social_properties' })
export class SocialPropertiesEntity {
  @PrimaryColumn({ name: 'provider', type: 'varchar', length: 64 })
  provider: string;

  @PrimaryColumn({ name: 'social_id', type: 'varchar', length: 255 })
  socialId: string;

  /** name, email, picture 등 provider별 프로필 데이터 */
  @Column({ name: 'properties', type: 'json', nullable: true })
  properties: Record<string, any> | null;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
