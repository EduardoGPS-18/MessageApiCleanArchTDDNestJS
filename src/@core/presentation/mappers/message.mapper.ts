import { MessageEntity } from '@domain/entities';
import { MessageDto, MessageOfGroupDto } from '@presentation/dtos';
import { UserMapper } from '@presentation/mappers';

export class MessageMapper {
  static toDto(message: MessageEntity): MessageDto {
    const { id, content, createdAt, sender, group } = message;
    const { id: groupId } = group;
    return {
      id: id,
      content: content,
      groupId: groupId,
      sendDate: createdAt,
      sender: UserMapper.toLessUserData(sender),
    };
  }

  static toMessageOfGroupDto(message: MessageEntity): MessageOfGroupDto {
    const { id, content, createdAt, sender: senderEntity } = message;
    const sendDate = createdAt;
    const sender = UserMapper.toLessUserData(senderEntity);
    return { id, content, sendDate, sender };
  }
}
