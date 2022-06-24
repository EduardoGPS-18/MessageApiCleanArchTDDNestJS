import { GetUserGroupListUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { GroupLessDto } from '@presentation/dtos';
import { GetUserEntity } from '@presentation/helpers/decorators';
import { JwtAuthGuard } from '@presentation/helpers/guard';
import { GroupMapper } from '@presentation/mappers';

@Controller('groups')
export class GetUserGroupListController {
  constructor(private readonly getUserGroupList: GetUserGroupListUseCaseI) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async handle(@GetUserEntity() user: UserEntity): Promise<GroupLessDto[]> {
    try {
      const { id: userId } = user;
      const groups = await this.getUserGroupList.execute({ userId });
      return groups.map((group) => GroupMapper.toLessDto(group));
    } catch (err) {
      if (err instanceof DomainError.InvalidUser) {
        throw new ForbiddenException();
      }
      throw new InternalServerErrorException();
    }
  }
}
