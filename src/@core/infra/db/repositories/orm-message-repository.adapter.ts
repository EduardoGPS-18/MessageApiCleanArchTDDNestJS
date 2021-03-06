import { GroupEntity, MessageEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { MessageRepository } from '@domain/repositories';
import { Repository } from 'typeorm';

export class OrmMessageRepositoryAdapter implements MessageRepository {
  constructor(
    private readonly ormMessageRepository: Repository<MessageEntity>,
  ) {}

  async update(message: MessageEntity): Promise<void> {
    try {
      await this.ormMessageRepository.save(message);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

  async findById(id: string): Promise<MessageEntity> {
    try {
      return await this.ormMessageRepository.findOneBy({ id });
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

  async delete(message: MessageEntity): Promise<void> {
    try {
      await this.ormMessageRepository.remove(message);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

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
