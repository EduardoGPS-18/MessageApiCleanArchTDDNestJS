import { AddUserToGroupUseCaseStub } from '@application-unit/mocks/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupWebSocketProviderStub } from '@presentation-unit/mocks';
import { AddUserToGroupController } from '@presentation/controllers';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const currentUserMock = UserEntity.create({
  id: 'current_user_id',
  email: 'current_user_email',
  name: 'current_user_name',
  password: 'current_user_password',
});

const addUserToGroup = GroupEntity.create({
  id: 'any_group_id',
  name: 'any_group_name',
  description: 'any_group_description',
  messages: [],
  users: [
    UserEntity.create({
      id: 'added_user_id',
      email: 'added_user_email',
      name: 'added_user_name',
      password: 'added_user_password',
    }),
  ],
  owner: currentUserMock,
});

type SutTypes = {
  addUserToGroupUseCase: AddUserToGroupUseCaseStub;
  groupWebSocket: GroupWebSocketProviderStub;
  sut: AddUserToGroupController;
};
const makeSut = (): SutTypes => {
  const addUserToGroupUseCase = new AddUserToGroupUseCaseStub();
  const groupWebSocket = new GroupWebSocketProviderStub();
  const sut = new AddUserToGroupController(
    addUserToGroupUseCase,
    groupWebSocket,
  );

  addUserToGroupUseCase.execute = jest.fn().mockResolvedValue(addUserToGroup);

  return { sut, addUserToGroupUseCase, groupWebSocket };
};

describe('AddUserToGroup || Controller || Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, addUserToGroupUseCase } = makeSut();
    jest.spyOn(addUserToGroupUseCase, 'execute');

    await sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    expect(addUserToGroupUseCase.execute).toHaveBeenCalledWith({
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
      adderId: 'current_user_id',
    });
  });

  it('Should throw ServerError if usecase throws Unexpected', async () => {
    const { sut, addUserToGroupUseCase } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(InternalServerErrorException);
  });

  it('Should throw BadRequest when usecase throws UserNotFound', async () => {
    const { sut, addUserToGroupUseCase } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserNotFound());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw BadRequest when usecase throws InvalidGroup', async () => {
    const { sut, addUserToGroupUseCase } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidGroup());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw BadRequest when usecase throws UserAlreadyInGroup', async () => {
    const { sut, addUserToGroupUseCase } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserAlreadyInGroup());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw Forbidden when usecase throws InvalidUser', async () => {
    const { sut, addUserToGroupUseCase } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should throw Forbidden when usecase throws UserNotAdminer', async () => {
    const { sut, addUserToGroupUseCase } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserNotAdminer());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should return a group without messages and emit to user on success', async () => {
    const { sut, addUserToGroupUseCase, groupWebSocket } = makeSut();
    jest.spyOn(addUserToGroupUseCase, 'execute');
    jest.spyOn(groupWebSocket, 'emitToUserAddedToGroup');

    const group = await sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    expect(groupWebSocket.emitToUserAddedToGroup).toBeCalledWith(
      'any_user_to_add_id',
      addUserToGroup,
    );
    expect(group).toEqual({
      id: 'any_group_id',
      description: 'any_group_description',
      users: [
        {
          id: 'added_user_id',
          email: 'added_user_email',
          name: 'added_user_name',
        },
      ],
      name: 'any_group_name',
      owner: {
        id: 'current_user_id',
        email: 'current_user_email',
        name: 'current_user_name',
      },
    });
  });
});
