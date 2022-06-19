import { Repository } from 'typeorm';
import { MessageEntity } from '../../../../domain/entities';
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

  async findByGroup(groupId: string): Promise<MessageEntity[]> {
    try {
      return await this.ormMessageRepository.findBy({ groupId: groupId });
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }
}
