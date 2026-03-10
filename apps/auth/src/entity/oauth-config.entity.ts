import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';

@Entity({ database: 'db_auth', name: 'tb_auth_oauth_config' })
export class OauthConfigEntity {
  @PrimaryColumn({ name: 'project_id', type: 'varchar', length: 255 })
  projectId: string;

  @PrimaryColumn({ name: 'provider', type: 'varchar', length: 64 })
  provider: string;

  /** provider별 OAuth 인증 정보 JSON (Google: client_id/secret, Apple: client_id/key 등) */
  @Column({ name: 'client_data', type: 'text' })
  clientData: string;

  @Column({ name: 'redirect_uri', type: 'varchar', length: 255 })
  redirectUri: string;

  @Column({ name: 'scope', type: 'varchar', length: 255 })
  scope: string;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
