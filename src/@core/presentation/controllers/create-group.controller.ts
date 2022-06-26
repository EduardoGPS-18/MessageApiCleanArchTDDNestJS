import { CreateGroupUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateGroupDto, GroupDto } from '@presentation/dtos';
import { GetUserEntity } from '@presentation/helpers/decorators';
import { JwtAuthGuard } from '@presentation/helpers/guard';
import { GroupMapper } from '@presentation/mappers';
import { GroupWebSocketProviderI } from '@presentation/protocols';

@Controller('group')
export class CreateGroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCaseI,
    private readonly groupWebSocket: GroupWebSocketProviderI,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async handle(
    @GetUserEntity() user: UserEntity,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<GroupDto> {
    const { name, description, usersIds } = createGroupDto;
    const { id: ownerId } = user;
    try {
      const group = await this.createGroupUseCase.execute({
        name,
        ownerId,
        usersIds,
        description,
      });
      usersIds.map((userId) => {
        this.groupWebSocket.emitToUserAddedToGroup(userId, group);
      });
      return GroupMapper.toDto(group);
    } catch (err) {
      if (err instanceof DomainError.MissingGroupOwner) {
        throw new BadRequestException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
