import { CreateGroupUseCase } from '@application/usecases';
import { GroupRepositoryStub, UserRepositoryStub } from '@domain-unit/mocks';
import { UserEntity } from '@domain/entities';
import { DomainError, RepositoryError } from '@domain/errors';
import * as crypto from 'crypto';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
jest.mock('crypto');

const owner = UserEntity.create({
  id: 'any_owner_id',
  name: 'any_owner_name',
  email: 'any_owner_email',
  password: 'any_owner_password',
});
const user = UserEntity.create({
  id: 'any_user_id_1',
  name: 'any_user_name_1',
  email: 'any_user_email_1',
  password: 'any_user_password_1',
});
const anotherUser = UserEntity.create({
  id: 'any_user_id_2',
  name: 'any_user_name_2',
  email: 'any_user_email_2',
  password: 'any_user_password_2',
});

type SutTypes = {
  groupRepository: GroupRepositoryStub;
  userRepository: UserRepositoryStub;
  sut: CreateGroupUseCase;
};
const makeSut = (): SutTypes => {
  const groupRepository = new GroupRepositoryStub();
  const userRepository = new UserRepositoryStub();
  const sut = new CreateGroupUseCase(groupRepository, userRepository);

  jest.spyOn(crypto, 'randomUUID').mockReturnValueOnce('gen_uuid');
  userRepository.findUserListByIdList = jest
    .fn()
    .mockResolvedValue([user, anotherUser]);
  userRepository.findOneById = jest.fn().mockResolvedValue(owner);

  return { sut, groupRepository, userRepository };
};

describe('CreateGroup || UseCase || Suit', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, groupRepository, userRepository } = makeSut();

    await sut.execute({
      name: 'any_group_name',
      description: 'any_group_description',
      ownerId: 'any_owner_id',
      usersIds: ['any_user_id_1', 'any_user_id_2'],
    });

    expect(crypto.randomUUID).toBeCalledTimes(1);
    expect(userRepository.findOneById).toHaveBeenCalledWith('any_owner_id');
    expect(userRepository.findUserListByIdList).toHaveBeenCalledWith([
      'any_user_id_1',
      'any_user_id_2',
    ]);
    expect(groupRepository.insert).toHaveBeenCalledWith({
      id: 'gen_uuid',
      name: 'any_group_name',
      description: 'any_group_description',
      messages: [],
      owner: UserEntity.create({
        id: 'any_owner_id',
        name: 'any_owner_name',
        email: 'any_owner_email',
        password: 'any_owner_password',
      }),
      users: [
        UserEntity.create({
          id: 'any_user_id_1',
          name: 'any_user_name_1',
          email: 'any_user_email_1',
          password: 'any_user_password_1',
        }),
        UserEntity.create({
          id: 'any_user_id_2',
          name: 'any_user_name_2',
          email: 'any_user_email_2',
          password: 'any_user_password_2',
        }),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('Should throw unexpected if groupRepository.insert fails', async () => {
    const { sut, groupRepository } = makeSut();

    groupRepository.insert = jest
      .fn()
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      name: 'any_group_name',
      description: 'any_group_description',
      ownerId: 'any_owner_id',
      usersIds: ['any_user_id_1', 'any_user_id_2'],
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw unexpected if userRepository.findOneById fails', async () => {
    const { sut, userRepository } = makeSut();

    jest
      .spyOn(userRepository, 'findOneById')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      name: 'any_group_name',
      description: 'any_group_description',
      ownerId: 'any_owner_id',
      usersIds: ['any_user_id_1', 'any_user_id_2'],
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw unexpected if userRepository.findUserListByIdList fails', async () => {
    const { sut, userRepository } = makeSut();

    jest
      .spyOn(userRepository, 'findUserListByIdList')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      name: 'any_group_name',
      description: 'any_group_description',
      ownerId: 'any_owner_id',
      usersIds: ['any_user_id_1', 'any_user_id_2'],
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw DomainError.MissingGroupOwner if UserRepository.findOneById not found any', async () => {
    const { sut, userRepository } = makeSut();

    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(null);

    const promise = sut.execute({
      name: 'any_group_name',
      description: 'any_group_description',
      ownerId: 'any_owner_id',
      usersIds: ['any_user_id_1', 'any_user_id_2'],
    });

    await expect(promise).rejects.toThrowError(DomainError.MissingGroupOwner);
  });

  it('Should return group entity on proccess succeed', async () => {
    const { sut } = makeSut();

    const group = await sut.execute({
      name: 'any_group_name',
      description: 'any_group_description',
      ownerId: 'any_owner_id',
      usersIds: ['any_user_id_1', 'any_user_id_2'],
    });

    expect(group).toEqual({
      id: 'gen_uuid',
      name: 'any_group_name',
      description: 'any_group_description',
      messages: [],
      owner: UserEntity.create({
        id: 'any_owner_id',
        name: 'any_owner_name',
        email: 'any_owner_email',
        password: 'any_owner_password',
      }),
      users: [
        UserEntity.create({
          id: 'any_user_id_1',
          name: 'any_user_name_1',
          email: 'any_user_email_1',
          password: 'any_user_password_1',
        }),
        UserEntity.create({
          id: 'any_user_id_2',
          name: 'any_user_name_2',
          email: 'any_user_email_2',
          password: 'any_user_password_2',
        }),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
});
