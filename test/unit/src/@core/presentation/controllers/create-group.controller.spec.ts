import {
  CreateGroupUseCaseI,
  CreateGroupUseCaseProps,
} from '@application/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateGroupController } from '@presentation/controllers';
import { GroupWebSocketProviderI } from '@presentation/protocols';

//TODO: CONTINUE HERE REFACTOR...
class GroupWebSocketProviderStub implements GroupWebSocketProviderI {
  emitToUserAddedToGroup(userId: string, group: GroupEntity): Promise<void> {
    return;
  }
  emitToUserRemovedFromGroup(
    userId: string,
    group: GroupEntity,
  ): Promise<void> {
    return;
  }
}
const mockStorageGroup = GroupEntity.create({
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
class CreateGroupUseCaseStub implements CreateGroupUseCaseI {
  async execute(
    createGroupUsecaseProps: CreateGroupUseCaseProps,
  ): Promise<GroupEntity> {
    return mockStorageGroup;
  }
}

describe('CreateGroup Controller', () => {
  it('Should call usecase correctly', async () => {
    const createGroupUsecase = new CreateGroupUseCaseStub();
    const groupWebSocketProvider = new GroupWebSocketProviderStub();
    const sut = new CreateGroupController(
      createGroupUsecase,
      groupWebSocketProvider,
    );
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
    const groupWebSocketProvider = new GroupWebSocketProviderStub();
    const sut = new CreateGroupController(
      createGroupUsecase,
      groupWebSocketProvider,
    );
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
    const groupWebSocketProvider = new GroupWebSocketProviderStub();
    const sut = new CreateGroupController(
      createGroupUsecase,
      groupWebSocketProvider,
    );
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

  it('Should return GroupDto on succeed and emit on websocket for users', async () => {
    const createGroupUsecase = new CreateGroupUseCaseStub();
    const groupWebSocketProvider = new GroupWebSocketProviderStub();
    const sut = new CreateGroupController(
      createGroupUsecase,
      groupWebSocketProvider,
    );
    jest.spyOn(createGroupUsecase, 'execute');
    jest.spyOn(groupWebSocketProvider, 'emitToUserAddedToGroup');
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
        usersIds: ['any_user_1', 'any_user_2'],
      },
    );
    expect(groupWebSocketProvider.emitToUserAddedToGroup).toBeCalledTimes(2);
    expect(groupWebSocketProvider.emitToUserAddedToGroup).toBeCalledWith(
      'any_user_1',
      mockStorageGroup,
    );
    expect(groupWebSocketProvider.emitToUserAddedToGroup).toBeCalledWith(
      'any_user_2',
      mockStorageGroup,
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
