import { GroupEntity } from '../../../domain/entities/group';
import { GroupDto } from '../dtos';
import { UserMapper } from './user.mapper';

export class GroupMapper {
  static toDto(group: GroupEntity): GroupDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      owner: UserMapper.toLessUserData(group.owner),
      users: group.users.map((user) => UserMapper.toLessUserData(user)),
    };
  }
}
