import { Repository } from 'typeorm';
import { GroupEntity } from '../../../../domain/entities/group';
import { RepositoryError } from '../../../../domain/errors/repository.error';
import { GroupRepository } from '../../../../domain/repositories';

export class OrmGroupRepositoryAdapter implements GroupRepository {
  constructor(private readonly ormGroupRepository: Repository<GroupEntity>) {}
  async update(group: GroupEntity): Promise<void> {
    try {
      await this.ormGroupRepository.save(group);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

  async findById(id: string): Promise<GroupEntity> {
    try {
      return await this.ormGroupRepository.findOneBy({ id });
    } catch (err) {
      console.log(err);
      throw new RepositoryError.OperationError();
    }
  }

  async insert(group: GroupEntity): Promise<void> {
    try {
      await this.ormGroupRepository.save(group);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }
}
