import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from '@libs/database';
import { Provider } from './provider.enum';

/** provider에서 수집한 프로필 정보. provider마다 제공하지 않는 필드는 NULL로 저장한다. */
@Entity({ database: 'db_auth', name: 'tb_auth_identity_properties' })
export class IdentityPropertiesEntity {
  @PrimaryColumn({ name: 'provider', type: 'varchar', length: 64 })
  provider: Provider;

  @PrimaryColumn({ name: 'provider_user_id', type: 'varchar', length: 255 })
  providerUserId: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ name: 'profile_picture_url', type: 'varchar', length: 512, nullable: true })
  profilePictureUrl: string | null;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}
