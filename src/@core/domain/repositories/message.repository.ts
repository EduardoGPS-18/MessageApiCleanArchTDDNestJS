import { MessageEntity } from '../entities';

export abstract class MessageRepository {
  abstract insert(message: MessageEntity): Promise<void>;
  abstract findByGroup(groupId: string): Promise<MessageEntity[]>;
}
