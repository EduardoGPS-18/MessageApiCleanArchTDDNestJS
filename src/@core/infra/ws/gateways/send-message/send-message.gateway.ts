import {
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendMessageToGroupUseCaseI } from '../../../../application/usecases/send-message-to-group';
import { UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';
import { SendMessageDto } from '../../../../infra/http/dtos';
import { MessageMapper } from '../../../../infra/http/mappers/message.mapper';
import { GetWSUserEntity } from '../helpers/decorators';
import { JwtWsAuthGuard } from '../helpers/guard';

//TODO: TEST SOCKET ITEMS
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
      this.server
        .in(message.group.id)
        .emit('new-messages', { message: message });

      return MessageMapper.toDto(message);
    } catch (err) {
      client.emit('error', { error: err });
      if (
        err instanceof DomainError.UserIsntInGroup ||
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.InvalidMessage
      ) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }
}
