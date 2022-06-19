import { GroupEntity, MessageEntity } from '../entities';

export abstract class MessageRepository {
  abstract insert(message: MessageEntity): Promise<void>;
  abstract findByGroup(group: GroupEntity): Promise<MessageEntity[]>;
}
