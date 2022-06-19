import { MessageEntity } from '../../../domain/entities';
import { MessageDto, MessageOfGroupDto } from '../dtos';
import { UserMapper } from './user.mapper';

export class MessageMapper {
  static toDto(message: MessageEntity): MessageDto {
    const { id, content, createdAt, sender, group } = message;
    return {
      id: id,
      content: content,
      groupId: group.id,
      sendDate: createdAt,
    };
  }

  static toMessageOfGroupDto(message: MessageEntity): MessageOfGroupDto {
    const { id, content, createdAt, sender: senderEntity } = message;
    const sendDate = createdAt;
    const sender = UserMapper.toLessUserData(senderEntity);
    return { id, content, sendDate, sender };
  }
}
