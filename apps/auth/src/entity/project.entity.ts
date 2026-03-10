import { Column, CreateDateColumn, Entity, PrimaryColumn } from '@libs/database';

@Entity({ database: 'db_auth', name: 'tb_auth_project_information' })
export class ProjectEntity {
  @PrimaryColumn({ name: 'project_id', type: 'varchar', length: 255 })
  projectId: string;

  @Column({ name: 'project_display_name', type: 'varchar', length: 255 })
  projectDisplayName: string;

  @CreateDateColumn({ name: 'reg_date' })
  regDate: Date;
}
