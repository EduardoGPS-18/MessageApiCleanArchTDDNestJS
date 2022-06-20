import { Repository } from 'typeorm';
import { GroupEntity, MessageEntity } from '../../../../domain/entities';
import { RepositoryError } from '../../../../domain/errors/repository.error';
import { MessageRepository } from '../../../../domain/repositories';

export class OrmMessageRepositoryAdapter implements MessageRepository {
  constructor(
    private readonly ormMessageRepository: Repository<MessageEntity>,
  ) {}

  async insert(message: MessageEntity): Promise<void> {
    try {
      await this.ormMessageRepository.save(message);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

  async findByGroup(group: GroupEntity): Promise<MessageEntity[]> {
    try {
      return await this.ormMessageRepository
        .createQueryBuilder('message')
        .andWhere('message.groupId = :groupId', { groupId: group.id })
        .leftJoinAndSelect('message.sender', 'user')
        .getMany();
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }
}
