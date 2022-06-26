import { GroupEntity } from '@domain/entities';

export abstract class GroupWebSocketProviderI {
  abstract emitToUserAddedToGroup(
    userId: string,
    group: GroupEntity,
  ): Promise<void>;
  abstract emitToUserRemovedFromGroup(
    userId: string,
    group: GroupEntity,
  ): Promise<void>;
}
