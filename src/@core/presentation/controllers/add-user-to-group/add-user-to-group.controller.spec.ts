import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AddUserToGroupProps,
  AddUserToGroupUseCaseI,
} from '../../../../application/usecases';
import { GroupEntity, UserEntity } from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';
import { AddUserToGroupController } from './add-user-to-group.controller';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

class AddUserToGroupUseCaseStub implements AddUserToGroupUseCaseI {
  async execute(props: AddUserToGroupProps): Promise<GroupEntity> {
    return GroupEntity.create({
      id: 'any_group_id',
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
      name: 'any_group_name',
      owner: UserEntity.create({
        id: 'current_user_id',
        email: 'current_user_email',
        name: 'current_user_name',
        password: 'current_user_password',
      }),
    });
  }
}

type SutTypes = {
  addUserToGroupUseCaseStub: AddUserToGroupUseCaseStub;
  currentUserMock: UserEntity;
  sut: AddUserToGroupController;
};
const makeSut = () => {
  const addUserToGroupUseCase = new AddUserToGroupUseCaseStub();
  const sut = new AddUserToGroupController(addUserToGroupUseCase);
  const currentUserMock = UserEntity.create({
    id: 'current_user_id',
    email: 'current_user_email',
    name: 'current_user_name',
    password: 'current_user_password',
  });
  return { sut, addUserToGroupUseCase, currentUserMock };
};

describe('Add User To Group Controller Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, addUserToGroupUseCase, currentUserMock } = makeSut();
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
    const { sut, addUserToGroupUseCase, currentUserMock } = makeSut();
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
    const { sut, addUserToGroupUseCase, currentUserMock } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserNotFound());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw BadRequest when usecase throws UserAlreadyInGroup', async () => {
    const { sut, addUserToGroupUseCase, currentUserMock } = makeSut();
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
    const { sut, addUserToGroupUseCase, currentUserMock } = makeSut();
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
    const { sut, addUserToGroupUseCase, currentUserMock } = makeSut();
    jest
      .spyOn(addUserToGroupUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.UserNotAdminer());

    const promise = sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

    await expect(promise).rejects.toThrowError(ForbiddenException);
  });

  it('Should return a group without messages on success', async () => {
    const { sut, addUserToGroupUseCase, currentUserMock } = makeSut();
    jest.spyOn(addUserToGroupUseCase, 'execute');

    const group = await sut.handle(currentUserMock, {
      groupId: 'any_group_id',
      userId: 'any_user_to_add_id',
    });

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
