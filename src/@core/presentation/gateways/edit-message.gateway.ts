import { EditMessageUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { EditMessageDto } from '@presentation/dtos';
import { GetWSUserEntity } from '@presentation/helpers/decorators';
import { MessageMapper } from '@presentation/mappers';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'messages' })
export class EditMessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly editMessageUseCase: EditMessageUseCaseI) {}

  async handle(
    @MessageBody() editMessageDto: EditMessageDto,
    @GetWSUserEntity() user: UserEntity,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { messageId, newMessageContent, groupId } = editMessageDto;
    const currentUserId = user.id;

    try {
      const message = await this.editMessageUseCase.execute({
        currentUserId,
        messageId,
        newMessageContent,
      });
      this.server.in(groupId).emit('updated_message', {
        message: MessageMapper.toDto(message),
      });
    } catch (err) {
      if (err instanceof DomainError.CurrentUserIsntMessageOwner) {
        client.emit('error', {
          error: 'Unauthorized',
        });
        return;
      }
      client.emit('error', {
        error: 'Server error',
      });
    }
  }
}
