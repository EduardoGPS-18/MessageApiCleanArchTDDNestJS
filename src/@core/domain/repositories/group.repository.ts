import { GroupEntity } from '../entities/group';

export abstract class GroupRepository {
  abstract insert(group: GroupEntity): Promise<void>;
  abstract update(group: GroupEntity): Promise<void>;
  abstract findById(id: string): Promise<GroupEntity>;
}
