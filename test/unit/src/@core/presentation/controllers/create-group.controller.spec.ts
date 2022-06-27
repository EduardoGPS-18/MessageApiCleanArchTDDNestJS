import { CreateGroupUseCaseStub } from '@application-unit/mocks/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupWebSocketProviderStub } from '@presentation-unit/mocks';
import { CreateGroupController } from '@presentation/controllers';

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

const mockedCurrentUser = UserEntity.create({
  email: 'any_current_user_email',
  id: 'any_current_user_id',
  name: 'any_current_user_name',
  password: 'any_current_user_password',
});

type SutTypes = {
  sut: CreateGroupController;
  createGroupUsecase: CreateGroupUseCaseStub;
  groupWebSocketProvider: GroupWebSocketProviderStub;
};

const makeSut = (): SutTypes => {
  const createGroupUsecase = new CreateGroupUseCaseStub();
  const groupWebSocketProvider = new GroupWebSocketProviderStub();
  const sut = new CreateGroupController(
    createGroupUsecase,
    groupWebSocketProvider,
  );

  createGroupUsecase.execute = jest.fn().mockResolvedValue(mockStorageGroup);

  return { sut, createGroupUsecase, groupWebSocketProvider };
};

describe('CreateGroup || Controller || Suit', () => {
  it('Should call usecase correctly', async () => {
    const { createGroupUsecase, sut } = makeSut();

    await sut.handle(mockedCurrentUser, {
      name: 'any_name',
      description: 'any_description',
      usersIds: [],
    });

    expect(createGroupUsecase.execute).toHaveBeenCalledWith({
      name: 'any_name',
      description: 'any_description',
      ownerId: 'any_current_user_id',
      usersIds: [],
    });
  });

  it('Should throw BadRequest if MissingOwnerId is throwed', async () => {
    const { sut, createGroupUsecase } = makeSut();
    jest
      .spyOn(createGroupUsecase, 'execute')
      .mockRejectedValueOnce(new DomainError.MissingGroupOwner());

    const promise = sut.handle(mockedCurrentUser, {
      name: 'any_name',
      description: 'any_description',
      usersIds: [],
    });

    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it('Should throw ServerError if Unexpected is throwed', async () => {
    const { sut, createGroupUsecase } = makeSut();
    jest
      .spyOn(createGroupUsecase, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());

    const promise = sut.handle(mockedCurrentUser, {
      name: 'any_name',
      description: 'any_description',
      usersIds: [],
    });

    await expect(promise).rejects.toThrow(InternalServerErrorException);
  });

  it('Should return GroupDto on succeed and emit on websocket for users', async () => {
    const { sut, groupWebSocketProvider } = makeSut();

    const group = await sut.handle(mockedCurrentUser, {
      name: 'any_name',
      description: 'any_description',
      usersIds: ['any_user_1', 'any_user_2'],
    });

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
