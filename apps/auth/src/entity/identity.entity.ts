import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';
import { Provider } from './provider.enum';

/** 소셜/외부 provider identity 전역 테이블. (provider, providerUserId) → uid 매핑. */
@Entity({ database: 'db_auth', name: 'tb_auth_identity' })
export class IdentityEntity {
  @PrimaryColumn({ name: 'provider', type: 'varchar', length: 64 })
  provider: Provider;

  @PrimaryColumn({ name: 'provider_user_id', type: 'varchar', length: 255 })
  providerUserId: string;

  /** account 테이블의 uid. 통합 계정 내부 식별자. */
  @Column({ name: 'uid', type: 'bigint' })
  uid: number;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
