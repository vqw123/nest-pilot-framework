import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { ProjectEntity } from '../../entity/project.entity';

/** 요청 경로의 :projectId가 DB에 등록된 프로젝트인지 검증한다. */
@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const projectId = request.params?.projectId;

    const project = await this.projectRepository.findOne({ where: { projectId } });
    if (!project) {
      throw new NotFoundException(`Project '${projectId}' not found`);
    }

    request.project = project;
    return true;
  }
}
