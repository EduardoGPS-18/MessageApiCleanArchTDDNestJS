import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateGroupUseCaseI } from '../../../../application/usecases/create-group';
import { UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';
import { CreateGroupDto, GroupDto } from '../../dtos';
import { GetUserEntity } from '../../helpers/decorators';
import { JwtAuthGuard } from '../../helpers/guard';
import { GroupMapper } from '../../mappers';

@Controller('group')
export class CreateGroupController {
  constructor(private readonly createGroupUseCase: CreateGroupUseCaseI) {}

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
