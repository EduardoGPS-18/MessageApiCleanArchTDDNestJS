import { RemoveUserFromGroupUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RemoveUserFromGroupDto } from '@presentation/dtos';
import { GetUserEntity } from '@presentation/helpers/decorators';
import { JwtAuthGuard } from '@presentation/helpers/guard';
import { GroupMapper } from '@presentation/mappers';
import { GroupWebSocketProviderI } from '@presentation/protocols';

@Controller('group')
export class RemoveUserFromGroupController {
  constructor(
    private readonly groupWebSocketProvider: GroupWebSocketProviderI,
    private readonly removeUserFromGroupUseCase: RemoveUserFromGroupUseCaseI,
  ) {}

  @Post('remove-user')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async handle(
    @GetUserEntity() user: UserEntity,
    @Body() removeUserDTO: RemoveUserFromGroupDto,
  ) {
    const { groupId, userId } = removeUserDTO;
    const { id: removerId } = user;
    const toRemoveUserId = userId;
    try {
      const group = await this.removeUserFromGroupUseCase.execute({
        groupId,
        removerId,
        toRemoveUserId,
      });
      await this.groupWebSocketProvider.emitToUserRemovedFromGroup(
        toRemoveUserId,
        group,
      );
      return GroupMapper.toDtoWithoutMessages(group);
    } catch (err) {
      if (
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.UserNotAdminer
      ) {
        throw new ForbiddenException();
      } else if (
        err instanceof DomainError.UserNotFound ||
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.UserIsntInGroup
      ) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
  }
}
