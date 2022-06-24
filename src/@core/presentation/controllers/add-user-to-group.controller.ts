import { AddUserToGroupUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddUserToGroupDto } from '@presentation/dtos';
import { GetUserEntity } from '@presentation/helpers/decorators';
import { JwtAuthGuard } from '@presentation/helpers/guard';
import { GroupMapper } from '@presentation/mappers';

//TODO: CHANGE THIS ROUTE TO WS

@Controller('group')
export class AddUserToGroupController {
  constructor(private addUserToGroupUseCase: AddUserToGroupUseCaseI) {}

  @Post('add-user')
  @UseGuards(JwtAuthGuard)
  async handle(
    @GetUserEntity() user: UserEntity,
    @Body() addUserToGroupDto: AddUserToGroupDto,
  ): Promise<any> {
    try {
      const { groupId, userId } = addUserToGroupDto;
      const adderId = user.id;

      const group = await this.addUserToGroupUseCase.execute({
        userId,
        adderId,
        groupId,
      });
      return GroupMapper.toDtoWithoutMessages(group);
    } catch (err) {
      if (
        err instanceof DomainError.UserNotFound ||
        err instanceof DomainError.UserAlreadyInGroup
      ) {
        throw new BadRequestException();
      } else if (
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.UserNotAdminer
      ) {
        throw new ForbiddenException();
      }
      throw new InternalServerErrorException();
    }
  }
}
