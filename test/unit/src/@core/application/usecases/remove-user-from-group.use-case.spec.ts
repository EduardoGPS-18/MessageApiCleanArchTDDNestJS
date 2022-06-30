import { RemoveUserFromGroupUseCase } from '@application/usecases/remove-user-from-group.use-case';
import { GroupRepositoryStub, UserRepositoryStub } from '@domain-unit/mocks';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError, RepositoryError } from '@domain/errors';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedGroupOwner = UserEntity.create({
  id: 'any_owner_id',
  name: 'any_owner_name',
  email: 'any_owner_email',
  password: 'any_owner_password',
});

const mockedUserInGroup = UserEntity.create({
  id: 'any_user_id',
  name: 'any_user_name',
  email: 'any_user_email',
  password: 'any_user_password',
});

const mockedUserOutOfGroup = UserEntity.create({
  id: 'any_not_owner_user_id',
  name: 'any_not_owner_user_name',
  email: 'any_not_owner_user_email',
  password: 'any_not_owner_user_password',
});

const mockedGroup = GroupEntity.create({
  id: 'any_group_id',
  name: 'any_group_name',
  description: 'any_group_description',
  owner: mockedGroupOwner,
  messages: [],
  users: [mockedUserInGroup],
});

type SutTypes = {
  sut: RemoveUserFromGroupUseCase;
  userRepository: UserRepositoryStub;
  groupRepository: GroupRepositoryStub;
};
const makeSut = (): SutTypes => {
  const userRepository = new UserRepositoryStub();
  const groupRepository = new GroupRepositoryStub();
  const sut = new RemoveUserFromGroupUseCase(userRepository, groupRepository);

  groupRepository.findById = jest.fn().mockResolvedValue(mockedGroup);

  return { sut, groupRepository, userRepository };
};

describe('RemoveUserFromGroup || UseCase || Suit', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, userRepository, groupRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(mockedUserInGroup);
    await sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    expect(userRepository.findOneById).toHaveBeenCalledWith('any_remover_id');
    expect(userRepository.findOneById).toHaveBeenCalledWith(
      'any_user_to_remove',
    );
    expect(groupRepository.findById).toBeCalledWith('any_group_id');
    expect(groupRepository.update).toBeCalledWith({
      ...mockedGroup,
      users: [],
    });

    expect(groupRepository.update).toBeCalledWith(
      GroupEntity.create({
        ...mockedGroup,
        users: [],
      }),
    );
  });

  it('Should throw InvalidUser if remover isnt found', async () => {
    const { sut, userRepository } = makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValue(null);

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.InvalidUser);
  });

  it('Should throw UserNotFound if user isnt found', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(null);

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.UserNotFound);
  });

  it('Should throw InvalidGroup if group isnt found', async () => {
    const { sut, userRepository, groupRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(mockedUserInGroup);
    jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(null);

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.InvalidGroup);
    mockedGroup.users.push(mockedUserInGroup);
  });

  it('Should throw if user isnt user adminer', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedUserOutOfGroup)
      .mockResolvedValueOnce(mockedUserInGroup);

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.UserNotAdminer);
  });

  it('Should throw if user isnt in group', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(mockedUserOutOfGroup);

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.UserIsntInGroup);
  });

  it('Should throw if user isnt in group', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(mockedUserOutOfGroup);

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.UserIsntInGroup);
  });

  it('Should throw Unexpected if userRepository searching for groupOwner throw', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.Unexpected);
  });

  it('Should throw Unexpected if userRepository searching for userToRemove throw', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.Unexpected);
  });

  it('Should throw Unexpected if groupRepository.findById throw', async () => {
    const { sut, userRepository, groupRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(mockedUserInGroup);

    jest
      .spyOn(groupRepository, 'findById')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.Unexpected);
  });

  it('Should throw Unexpected if groupRepository.update throw', async () => {
    const { sut, userRepository, groupRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(mockedUserInGroup);
    jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(mockedGroup);
    jest
      .spyOn(groupRepository, 'update')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrow(DomainError.Unexpected);
  });

  it('Should return group on proccess succeed', async () => {
    const { sut, userRepository } = makeSut();
    mockedGroup.users.push(mockedUserInGroup);
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(mockedGroupOwner)
      .mockResolvedValueOnce(mockedUserInGroup);

    const group = await sut.execute({
      toRemoveUserId: 'any_user_to_remove',
      removerId: 'any_remover_id',
      groupId: 'any_group_id',
    });

    expect(group).toEqual(mockedGroup);
  });
});
