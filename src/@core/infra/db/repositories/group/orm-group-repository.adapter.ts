import { Repository } from 'typeorm';
import { GroupEntity } from '../../../../domain/entities/group';
import { RepositoryError } from '../../../../domain/errors/repository.error';
import { GroupRepository } from '../../../../domain/repositories';

export class OrmGroupRepositoryAdapter implements GroupRepository {
  constructor(private readonly ormGroupRepository: Repository<GroupEntity>) {}

  async insert(group: GroupEntity): Promise<void> {
    try {
      await this.ormGroupRepository.save(group);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }
}
