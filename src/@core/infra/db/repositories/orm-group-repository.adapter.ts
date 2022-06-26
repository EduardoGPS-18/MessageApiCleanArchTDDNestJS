import { GroupEntity, UserEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { GroupRepository } from '@domain/repositories';
import { Repository } from 'typeorm';

export class OrmGroupRepositoryAdapter implements GroupRepository {
  constructor(private readonly ormGroupRepository: Repository<GroupEntity>) {}

  async findByUser(user: UserEntity): Promise<GroupEntity[]> {
    try {
      //TODO: FIX IT
      const { id: userId } = user;
      const groups = await this.ormGroupRepository
        .createQueryBuilder('group')
        .innerJoin(
          'users-group',
          'user-group',
          'user-group.group_id = group.id',
        )
        .innerJoinAndMapOne('group.owner', 'user', 'u', 'u.id = group.owner.id')
        .innerJoin(
          'user',
          'user',
          'user-group.user_id = :userId OR group.owner.id = :userId',
          {
            userId,
          },
        )
        .getMany();
      return groups;
    } catch (err) {
      console.log(err);
      throw new RepositoryError.OperationError();
    }
  }

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
