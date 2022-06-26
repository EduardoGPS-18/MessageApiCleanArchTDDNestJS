import { SendMessageToGroupUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SendMessageDto } from '@presentation/dtos';
import { GetWSUserEntity } from '@presentation/helpers/decorators';
import { JwtWsAuthGuard } from '@presentation/helpers/guard';
import { MessageMapper } from '@presentation/mappers';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'messages' })
export class SendMessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly sendMessageUsecase: SendMessageToGroupUseCaseI,
  ) {}

  handleDisconnect(@ConnectedSocket() client: Socket) {
    client.leave(`${client.request.headers.groupid}`);
  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    client.join(client.request.headers.groupid);
  }

  @SubscribeMessage('send')
  @UseGuards(JwtWsAuthGuard)
  async handle(
    @GetWSUserEntity() user: UserEntity,
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    try {
      const senderId = user.id;
      const { messageContent, groupId } = sendMessageDto;
      const message = await this.sendMessageUsecase.execute({
        messageContent,
        groupId,
        senderId,
      });
      this.server.in(message.group.id).emit('new-messages', {
        message: MessageMapper.toMessageOfGroupDto(message),
      });
      return MessageMapper.toDto(message);
    } catch (err) {
      if (
        err instanceof DomainError.UserIsntInGroup ||
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.InvalidMessage
      ) {
        client.emit('error', { error: 'Invalid sended arguments' });
        return;
      }
      client.emit('error', { error: 'Server error' });
    }
  }
}
