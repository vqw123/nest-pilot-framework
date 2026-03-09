# @libs/database

TypeORM 연결 설정과 Repository 패턴을 제공하는 라이브러리입니다.

## 사용법

### 연결 설정 (AppModule)

```typescript
import { DatabaseModule } from '@libs/database';

// 비동기 설정 (권장)
DatabaseModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    ...configService.get('database'),
  }),
  inject: [ConfigService],
})

// 동기 설정
DatabaseModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'mydb',
})
```

### Entity 등록 (FeatureModule)

```typescript
import { DatabaseModule } from '@libs/database';

@Module({
  imports: [DatabaseModule.forFeature([UserEntity])],
  providers: [UserRepository, UserService],
})
export class UserModule {}
```

## Entity 정의

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from '@libs/database';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

## Repository 패턴

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}
```

## config 예시

```yaml
# apps/{appName}/config/{NODE_ENV}/database.yml
database:
  type: postgres
  host: localhost
  port: 5432
  username: user
  password: password
  database: mydb
  synchronize: false
  autoLoadEntities: true
```

## 참고

- `forRoot`는 global로 등록되어 `DataSource`를 어디서든 주입받을 수 있습니다.
- `forFeature`는 feature 모듈 스코프에서만 동작합니다.
- `@nestjs/typeorm`, `typeorm` 직접 import 없이 `@libs/database`만으로 사용 가능합니다.
