import { GroupEntity, MessageEntity } from '@domain/entities';
import { MessageRepository } from '@domain/repositories';

export class MessageRepositoryStub implements MessageRepository {
  update: (message: MessageEntity) => Promise<void> = jest.fn();

  findById: (id: string) => Promise<MessageEntity> = jest.fn();

  delete: (message: MessageEntity) => Promise<void> = jest.fn();

  insert: (message: MessageEntity) => Promise<void> = jest.fn();

  findByGroup: (group: GroupEntity) => Promise<MessageEntity[]> = jest.fn();
}
