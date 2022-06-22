import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GetGroupMessageListUseCaseI } from '../../../../application/usecases/get-group-messages';
import { UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';
import { GetMessageListByGroupDto } from '../../dtos';
import { GetUserEntity } from '../../helpers/decorators';
import { JwtAuthGuard } from '../../helpers/guard';
import { MessageMapper } from '../../mappers/message.mapper';

@Controller('messages')
export class GetGroupMessageListController {
  constructor(
    private readonly getGroupMessageListUseCase: GetGroupMessageListUseCaseI,
  ) {}

  @Get('/:groupId')
  @UseGuards(JwtAuthGuard)
  async handle(
    @GetUserEntity() user: UserEntity,
    @Param() getMessageListByGroupDto: GetMessageListByGroupDto,
  ): Promise<any> {
    const { groupId } = getMessageListByGroupDto;
    const userId = user.id;

    try {
      const messages = await this.getGroupMessageListUseCase.execute({
        groupId,
        userId,
      });
      return messages.map((message) =>
        MessageMapper.toMessageOfGroupDto(message),
      );
    } catch (err) {
      if (err instanceof DomainError.InvalidGroup) {
        throw new BadRequestException();
      }
      throw new ForbiddenException();
    }
  }
}
