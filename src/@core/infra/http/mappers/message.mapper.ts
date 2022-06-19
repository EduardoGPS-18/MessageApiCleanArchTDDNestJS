import { MessageEntity } from 'src/@core/domain/entities';
import { MessageDto } from '../dtos';
import { UserMapper } from './user.mapper';

export class MessageMapper {
  static toDto(message: MessageEntity): MessageDto {
    const { id, content, createdAt, sender } = message;
    return {
      id: id,
      content: content,
      sendDate: createdAt,
      sender: UserMapper.toLessUserData(sender),
    };
  }
}
