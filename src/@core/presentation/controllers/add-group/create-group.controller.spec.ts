import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateGroupUseCaseI,
  CreateGroupUseCaseProps,
} from '../../../../application/usecases/create-group';
import { UserEntity } from '../../../../domain/entities/';
import { GroupEntity } from '../../../../domain/entities/group';
import { DomainError } from '../../../../domain/errors/domain.error';
import { CreateGroupController } from './create-group.controller';

class CreateGroupUseCaseStub implements CreateGroupUseCaseI {
  async execute(
    createGroupUsecaseProps: CreateGroupUseCaseProps,
  ): Promise<GroupEntity> {
    return GroupEntity.create({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      messages: [],
      owner: UserEntity.create({
        id: 'any_id',
        email: 'any_email',
        name: 'any_name',
        password: 'any_password',
      }),
      users: [
        UserEntity.create({
          id: 'user_id_1',
          email: 'user_email_1',
          name: 'user_name_1',
          password: 'user_password_1',
        }),
        UserEntity.create({
          id: 'user_id_2',
          email: 'user_email_2',
          name: 'user_name_2',
          password: 'user_password_2',
        }),
      ],
    });
  }
}

describe('CreateGroup Controller', () => {
  it('Should call usecase correctly', async () => {
    const createGroupUsecase = new CreateGroupUseCaseStub();
    const sut = new CreateGroupController(createGroupUsecase);
    jest.spyOn(createGroupUsecase, 'execute');
    await sut.handle(
      UserEntity.create({
        email: 'any_current_user_email',
        id: 'any_current_user_id',
        name: 'any_current_user_name',
        password: 'any_current_user_password',
      }),
      {
        name: 'any_name',
        description: 'any_description',
        usersIds: [],
      },
    );
    expect(createGroupUsecase.execute).toHaveBeenCalledWith({
      name: 'any_name',
      description: 'any_description',
      ownerId: 'any_current_user_id',
      usersIds: [],
    });
  });

  it('Should throw BadRequest if MissingOwnerId is throwed', async () => {
    const createGroupUsecase = new CreateGroupUseCaseStub();
    const sut = new CreateGroupController(createGroupUsecase);
    jest
      .spyOn(createGroupUsecase, 'execute')
      .mockRejectedValueOnce(new DomainError.MissingGroupOwner());
    const promise = sut.handle(
      UserEntity.create({
        email: 'any_current_user_email',
        id: 'any_current_user_id',
        name: 'any_current_user_name',
        password: 'any_current_user_password',
      }),
      {
        name: 'any_name',
        description: 'any_description',
        usersIds: [],
      },
    );
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it('Should throw ServerError if Unexpected is throwed', async () => {
    const createGroupUsecase = new CreateGroupUseCaseStub();
    const sut = new CreateGroupController(createGroupUsecase);
    jest
      .spyOn(createGroupUsecase, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());
    const promise = sut.handle(
      UserEntity.create({
        email: 'any_current_user_email',
        id: 'any_current_user_id',
        name: 'any_current_user_name',
        password: 'any_current_user_password',
      }),
      {
        name: 'any_name',
        description: 'any_description',
        usersIds: [],
      },
    );
    await expect(promise).rejects.toThrow(InternalServerErrorException);
  });

  it('Should return GroupDto on succeed', async () => {
    const createGroupUsecase = new CreateGroupUseCaseStub();
    const sut = new CreateGroupController(createGroupUsecase);
    jest.spyOn(createGroupUsecase, 'execute');
    const group = await sut.handle(
      UserEntity.create({
        email: 'any_current_user_email',
        id: 'any_current_user_id',
        name: 'any_current_user_name',
        password: 'any_current_user_password',
      }),
      {
        name: 'any_name',
        description: 'any_description',
        usersIds: [],
      },
    );
    expect(group).toEqual({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      messages: [],
      owner: {
        id: 'any_id',
        email: 'any_email',
        name: 'any_name',
      },
      users: [
        {
          id: 'user_id_1',
          email: 'user_email_1',
          name: 'user_name_1',
        },
        {
          id: 'user_id_2',
          email: 'user_email_2',
          name: 'user_name_2',
        },
      ],
    });
  });
});
