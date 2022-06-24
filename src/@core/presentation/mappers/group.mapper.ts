import { GroupEntity } from '@domain/entities';
import {
  GroupDto,
  GroupLessDto,
  GroupWithoutMessagesDto,
} from '@presentation/dtos';
import { MessageMapper, UserMapper } from '@presentation/mappers';

export class GroupMapper {
  static toDto(group: GroupEntity): GroupDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      owner: UserMapper.toLessUserData(group.owner),
      users: group.users.map((user) => UserMapper.toLessUserData(user)),
      messages: group.messages.map((message) => MessageMapper.toDto(message)),
    };
  }

  static toDtoWithoutMessages(group: GroupEntity): GroupWithoutMessagesDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      owner: UserMapper.toLessUserData(group.owner),
      users: group.users.map((user) => UserMapper.toLessUserData(user)),
    };
  }

  static toLessDto(group: GroupEntity): GroupLessDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      owner: UserMapper.toLessUserData(group.owner),
    };
  }
}
