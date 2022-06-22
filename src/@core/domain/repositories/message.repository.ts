import { GroupEntity, MessageEntity } from '../entities';

export abstract class MessageRepository {
  abstract insert(message: MessageEntity): Promise<void>;
  abstract findByGroup(group: GroupEntity): Promise<MessageEntity[]>;
  abstract delete(message: MessageEntity): Promise<void>;
  abstract findById(id: string): Promise<MessageEntity>;
}
