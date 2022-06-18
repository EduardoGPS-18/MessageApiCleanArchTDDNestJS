import { GroupEntity } from '../entities/group';

export abstract class GroupRepository {
  abstract insert(group: GroupEntity): Promise<void>;
}
