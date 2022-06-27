import { GroupEntity } from '@domain/entities';
import { GroupWebSocketProviderI } from '@presentation/protocols';

export class GroupWebSocketProviderStub implements GroupWebSocketProviderI {
  emitToUserAddedToGroup: (
    userId: string,
    group: GroupEntity,
  ) => Promise<void> = jest.fn();

  emitToUserRemovedFromGroup: (
    userId: string,
    group: GroupEntity,
  ) => Promise<void> = jest.fn();
}
