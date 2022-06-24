import { GroupEntity, UserEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { GroupRepository } from '@domain/repositories';
import { Repository } from 'typeorm';

export class OrmGroupRepositoryAdapter implements GroupRepository {
  constructor(private readonly ormGroupRepository: Repository<GroupEntity>) {}

  async findByUser(user: UserEntity): Promise<GroupEntity[]> {
    try {
      const { id: userId } = user;
      const groups = await this.ormGroupRepository
        .createQueryBuilder('g')
        .innerJoinAndSelect(
          'users-group',
          'user_group',
          'user_group.user_id = :userId OR g.owner.id = :userId',
          {
            userId,
          },
        )
        .setFindOptions({ relations: { owner: true } })
        .getMany();
      return groups;

      // .andWhere('message.groupId = :groupId', { groupId: group.id })
      // .leftJoinAndSelect('message.sender', 'user')
      // .getMany();
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
