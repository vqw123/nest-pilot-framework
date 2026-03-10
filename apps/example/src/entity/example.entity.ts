import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from '@libs/database';

/**
 * examples 테이블 엔티티.
 * DB 레이어 관심사(컬럼 정의, 인덱스 등)만 포함하며
 * Swagger(@ApiProperty) 같은 HTTP 레이어 데코레이터는 ResponseDto에서 관리한다.
 */
@Entity({
  database: 'nest_example',
  name: 'examples',
})
export class ExampleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
