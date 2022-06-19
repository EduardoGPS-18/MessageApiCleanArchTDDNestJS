import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SendMessageToGroupUseCaseI } from '../../../../application/usecases/send-message-to-group';
import { UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';
import { SendMessageDto } from '../../dtos';
import { GetUserEntity } from '../../helpers/decorators';
import { JwtAuthGuard } from '../../helpers/guard';
import { MessageMapper } from '../../mappers/message.mapper';

@Controller('message')
export class SendMessageController {
  constructor(
    private readonly sendMessageUsecase: SendMessageToGroupUseCaseI,
  ) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  async handle(
    @GetUserEntity() user: UserEntity,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<any> {
    try {
      const senderId = user.id;
      const { messageContent, groupId } = sendMessageDto;
      const message = await this.sendMessageUsecase.execute({
        messageContent,
        groupId,
        senderId,
      });
      return MessageMapper.toDto(message);
    } catch (err) {
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
