import { GroupEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { GroupRepository } from '@domain/repositories';
import { Repository } from 'typeorm';

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
