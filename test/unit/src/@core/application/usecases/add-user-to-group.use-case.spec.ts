import { AddUserToGroupUseCase } from '@application/usecases';
import { GroupRepositoryStub, UserRepositoryStub } from '@domain-unit/mocks';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedNotOwner = UserEntity.create({
  id: 'any_not_owner_user_id',
  name: 'any_not_owner_user_name',
  email: 'any_not_owner_user_email',
  password: 'any_not_owner_user_password',
});

const mockedOwner = UserEntity.create({
  id: 'any_owner_id',
  name: 'any_owner_name',
  email: 'any_owner_email',
  password: 'any_owner_password',
});

const mockedUser = UserEntity.create({
  id: 'any_user_id',
  name: 'any_user_name',
  email: 'any_user_email',
  password: 'any_user_password',
});

const mockedGroup = GroupEntity.create({
  id: 'any_group_id',
  name: 'any_group_name',
  description: 'any_group_description',
  owner: mockedOwner,
  messages: [],
  users: [],
});

type SutTypes = {
  sut: AddUserToGroupUseCase;
  groupRepository: GroupRepositoryStub;
  userRepository: UserRepositoryStub;
};
const makeSut = (): SutTypes => {
  const groupRepository = new GroupRepositoryStub();
  const userRepository = new UserRepositoryStub();

  groupRepository.findById = jest.fn().mockResolvedValueOnce(mockedGroup);
  userRepository.findOneById = jest
    .fn()
    .mockResolvedValueOnce(mockedUser)
    .mockResolvedValueOnce(mockedOwner);

  const sut = new AddUserToGroupUseCase(groupRepository, userRepository);
  return { sut, groupRepository, userRepository };
};

describe('AddUserToGroup || UseCase || Suit', () => {
  beforeEach(() => {
    mockedGroup.users = [];
  });

  it('Should call correctly dependencies', async () => {
    const { sut, groupRepository, userRepository } = makeSut();
    const localMockedGroup = { ...mockedGroup };

    await sut.execute({
      userId: 'any_user_id',
      adderId: 'any_owner_id',
      groupId: 'any_group_id',
    });

    expect(userRepository.findOneById).toHaveBeenCalledWith('any_owner_id');
    expect(userRepository.findOneById).toHaveBeenCalledWith('any_user_id');
    expect(groupRepository.findById).toHaveBeenCalledWith('any_group_id');
    expect(groupRepository.update).toHaveBeenCalledWith(localMockedGroup);
  });

  it('Should throw DomainError.UserNotAdminer if adder user id isnt group owner', async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findOneById = jest
      .fn()
      .mockResolvedValueOnce(mockedUser)
      .mockResolvedValueOnce(mockedNotOwner);

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.UserNotAdminer);
  });

  it('Should throw DomainError.UserAlreadyInGroup if user is adder', async () => {
    const { sut } = makeSut();
    mockedGroup.users.push(mockedUser);

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: mockedGroup.owner.id,
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.UserAlreadyInGroup);
  });

  it('Should throw DomainError.UserAlreadyInGroup if user already is in group', async () => {
    const { sut } = makeSut();
    mockedGroup.users.push(mockedUser);

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: mockedGroup.owner.id,
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.UserAlreadyInGroup);
  });

  it('Should throw DomainError.InvalidUser if adder isnt found ', async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findOneById = jest
      .fn()
      .mockResolvedValueOnce(mockedUser)
      .mockResolvedValueOnce(null);

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidGroup if group isnt found ', async () => {
    const { sut, groupRepository } = makeSut();
    groupRepository.findById = jest.fn().mockResolvedValueOnce(null);

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidGroup);
  });

  it('Should throw DomainError.UserNotFound if user isnt found ', async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findOneById = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockedOwner);

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.UserNotFound);
  });

  it('Should throw DomainError.Unexpected if user isnt userRepository.findOneById throws ', async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findOneById = jest.fn().mockRejectedValueOnce(new Error());

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw DomainError.Unexpected if user isnt groupRepositoryRepository.findOneById throws ', async () => {
    const { sut, groupRepository } = makeSut();
    groupRepository.findById = jest.fn().mockRejectedValueOnce(new Error());

    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should return a group without messages on succeed ', async () => {
    const { sut } = makeSut();

    const group = await sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });

    expect(group).toEqual({ ...mockedGroup, users: [mockedUser] });
  });
});
