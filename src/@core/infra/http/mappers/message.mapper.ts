import { MessageEntity } from '../../../domain/entities';
import { MessageDto } from '../dtos';

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
}
