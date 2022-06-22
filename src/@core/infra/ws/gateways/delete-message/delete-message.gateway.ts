import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DeleteMessageUseCase } from '../../../../application/usecases/delete-message-of-group/delete-message-of-group.usecase';
import { UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';
import { DeleteMessageDto } from '../../dtos/delete-message.dto';
import { GetWSUserEntity } from '../helpers/decorators';
import { JwtWsAuthGuard } from '../helpers/guard';

@WebSocketGateway({ namespace: 'messages' })
export class DeleteMessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private deleteMessageUseCase: DeleteMessageUseCase) {}

  @SubscribeMessage('delete')
  @UseGuards(JwtWsAuthGuard)
  async handle(
    @MessageBody() deleteMessageDto: DeleteMessageDto,
    @GetWSUserEntity() user: UserEntity,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const currentUserId = user.id;
    const { groupId, messageId } = deleteMessageDto;
    try {
      await this.deleteMessageUseCase.execute({
        currentUserId,
        groupId,
        messageId,
      });
      this.server.in(groupId).emit('remove-message', { messageId: messageId });
    } catch (err) {
      if (
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.CurrentUserIsntMessageOwner
      ) {
        client.emit('error', { error: 'Unauthorized' });
        throw new ForbiddenException();
      } else if (
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.InvalidMessage
      ) {
        client.emit('error', { error: 'Invalid sended arguments' });
        throw new BadRequestException();
      }
      client.emit('error', { error: 'Internal server exception' });
      throw new InternalServerErrorException();
    }
  }
}
