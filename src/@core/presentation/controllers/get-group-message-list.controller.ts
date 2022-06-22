import { GetGroupMessageListUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GetMessageListByGroupDto } from '@presentation/dtos';
import { GetUserEntity } from '@presentation/helpers/decorators';
import { JwtAuthGuard } from '@presentation/helpers/guard';
import { MessageMapper } from '@presentation/mappers';

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
