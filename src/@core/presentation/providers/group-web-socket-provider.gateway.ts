import { ValidateUserUseCaseI } from '@application/usecases';
import { GroupEntity } from '@domain/entities';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { PresentationHelpers } from '@presentation/helpers/methods';
import { GroupMapper } from '@presentation/mappers';
import { GroupWebSocketProviderI } from '@presentation/protocols';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'group' })
export class GroupWebSocketProviderGateway
  implements GroupWebSocketProviderI, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly validateUser: ValidateUserUseCaseI) {}

  clients: { userId: string; client: Socket }[] = [];
  clientByUserId(userId: string): Socket | undefined {
    try {
      return this.clients.filter((value) => value.userId == userId)[0].client;
    } catch (err) {
      return;
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const session = client.handshake.headers.authorization.split(' ')[1];
      if (!session) {
        client.disconnect();
        return;
      }
      const user = await this.validateUser.execute({ session });
      this.clients.push({ userId: user.id, client: client });
      PresentationHelpers.addUserToObject(client.data, user);
    } catch (err) {
      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    this.clients = this.clients.filter((value) => {
      return !client.data.user || value.userId !== client.data.user.id;
    });
  }

  async emitToUserAddedToGroup(
    userId: string,
    group: GroupEntity,
  ): Promise<void> {
    try {
      this.clientByUserId(userId)?.emit(
        'added-to-group',
        GroupMapper.toDtoWithoutMessages(group),
      );
    } catch (err) {
      return;
    }
  }

  async emitToUserRemovedFromGroup(
    userId: string,
    group: GroupEntity,
  ): Promise<void> {
    try {
      this.clientByUserId(userId)?.emit(
        'remove-from-group',
        GroupMapper.toDtoWithoutMessages(group),
      );
    } catch (err) {
      return;
    }
  }
}
