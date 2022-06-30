import { RemoveUserFromGroupUseCaseStub } from '@application-unit/mocks/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupWebSocketProviderStub } from '@presentation-unit/mocks';
import { RemoveUserFromGroupController } from '@presentation/controllers';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedCurrentUser = UserEntity.create({
  id: 'any_current_user_id',
  name: 'any_current_user_name',
  email: 'any_current_user_email',
  password: 'any_current_user_password',
});

const mockedOwner = UserEntity.create({
  id: 'any_owner_id',
  name: 'any_owner_name',
  email: 'any_owner_email',
  password: 'any_owner_password',
});

const mockedGroup = GroupEntity.create({
  id: 'any_group_id',
  name: 'any_group_name',
  description: 'any_group_description',
  owner: mockedOwner,
  messages: [],
  users: [mockedCurrentUser],
});

describe('RemoveUserFromGroup || Controller || Suit', () => {
  let usecase: RemoveUserFromGroupUseCaseStub;
  let groupWebSocketProvider: GroupWebSocketProviderStub;
  let sut: RemoveUserFromGroupController;

  beforeEach(() => {
    usecase = new RemoveUserFromGroupUseCaseStub();
    groupWebSocketProvider = new GroupWebSocketProviderStub();
    sut = new RemoveUserFromGroupController(groupWebSocketProvider, usecase);

    usecase.execute = jest.fn().mockResolvedValue(mockedGroup);
  });

  it('Should call usecase correctly', async () => {
    await sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    expect(usecase.execute).toBeCalledWith({
      groupId: 'any_group_id',
      removerId: 'any_current_user_id',
      toRemoveUserId: 'any_user_id',
    });
  });

  it('Should throw forbidden if when usecase throw InvalidUser', async () => {
    jest
      .spyOn(usecase, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());

    const promise = sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should return forbidden when usecase throw UserNotAdminer', async () => {
    jest
      .spyOn(usecase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserNotAdminer());

    const promise = sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should return badRequest if when usecase throw UserNotFound', async () => {
    jest
      .spyOn(usecase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserNotFound());

    const promise = sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should return badRequest if when usecase throw UserNotFound', async () => {
    jest
      .spyOn(usecase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserIsntInGroup());

    const promise = sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should return badRequest if when usecase throw InvalidGroup', async () => {
    jest
      .spyOn(usecase, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidGroup());

    const promise = sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should return serverError if when usecase throw Unexpected', async () => {
    jest
      .spyOn(usecase, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());

    const promise = sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(InternalServerErrorException);
  });

  it('Should emit to user that he has a new group', async () => {
    await sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    expect(groupWebSocketProvider.emitToUserRemovedFromGroup).toBeCalledWith(
      'any_user_id',
      mockedGroup,
    );
  });

  it('Should return a GroupWithoutMessages to user on succeed', async () => {
    const group = await sut.handle(mockedCurrentUser, {
      groupId: 'any_group_id',
      userId: 'any_user_id',
    });

    expect(group).toEqual({
      id: 'any_group_id',
      name: 'any_group_name',
      description: 'any_group_description',
      owner: {
        id: 'any_owner_id',
        name: 'any_owner_name',
        email: 'any_owner_email',
      },
      users: [
        {
          id: 'any_current_user_id',
          name: 'any_current_user_name',
          email: 'any_current_user_email',
        },
      ],
    });
  });
});
