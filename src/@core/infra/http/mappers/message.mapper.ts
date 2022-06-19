import { MessageEntity } from '../../../domain/entities';
import { MessageDto } from '../dtos';
import { UserMapper } from './user.mapper';

export class MessageMapper {
  static toDto(message: MessageEntity): MessageDto {
    const { id, content, createdAt, sender, groupId } = message;
    return {
      id: id,
      content: content,
      groupId: groupId,
      sendDate: createdAt,
      sender: UserMapper.toLessUserData(sender),
    };
  }
}
