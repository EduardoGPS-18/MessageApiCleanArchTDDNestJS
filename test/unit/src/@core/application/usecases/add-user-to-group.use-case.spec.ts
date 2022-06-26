import { AddUserToGroupUseCase } from '@application/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { GroupRepository, UserRepository } from '@domain/repositories';

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

class UserRepositoryStub implements UserRepository {
  insert(user: UserEntity): Promise<void> {
    return;
  }
  update(user: UserEntity): Promise<void> {
    return;
  }
  async findOneById(id: string): Promise<UserEntity> {
    return mockedUser;
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return;
  }
  findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    return;
  }
}
class GroupRepositoryStub implements GroupRepository {
  findByUser(user: UserEntity): Promise<GroupEntity[]> {
    return;
  }
  insert(group: GroupEntity): Promise<void> {
    return;
  }
  update(group: GroupEntity): Promise<void> {
    return;
  }
  async findById(id: string): Promise<GroupEntity> {
    return mockedGroup;
  }
}

type SutTypes = {
  sut: AddUserToGroupUseCase;
  groupRepositoryStub: GroupRepositoryStub;
  userRepositoryStub: UserRepositoryStub;
};
const makeSut = (): SutTypes => {
  const groupRepositoryStub = new GroupRepositoryStub();
  const userRepositoryStub = new UserRepositoryStub();
  const sut = new AddUserToGroupUseCase(
    groupRepositoryStub,
    userRepositoryStub,
  );
  return { sut, groupRepositoryStub, userRepositoryStub };
};

describe('Add User To Group Suit', () => {
  it('Should call correctly dependencies', async () => {
    const { sut, groupRepositoryStub, userRepositoryStub } = makeSut();
    const localMockedGroup = { ...mockedGroup };

    jest.spyOn(groupRepositoryStub, 'findById');
    jest.spyOn(groupRepositoryStub, 'update');
    jest
      .spyOn(userRepositoryStub, 'findOneById')
      .mockResolvedValueOnce(mockedUser)
      .mockResolvedValueOnce(mockedOwner);
    await sut.execute({
      userId: 'any_user_id',
      adderId: 'any_owner_id',
      groupId: 'any_group_id',
    });
    expect(userRepositoryStub.findOneById).toHaveBeenCalledWith('any_owner_id');
    expect(userRepositoryStub.findOneById).toHaveBeenCalledWith('any_user_id');
    expect(groupRepositoryStub.findById).toHaveBeenCalledWith('any_group_id');
    localMockedGroup.users.push(mockedUser);
    expect(groupRepositoryStub.update).toHaveBeenCalledWith(localMockedGroup);
  });

  it('Should throw DomainError.UserNotAdminer if adder user id isnt group owner', async () => {
    const { sut, groupRepositoryStub, userRepositoryStub } = makeSut();
    const localMockedUser = { ...mockedGroup };
    jest.spyOn(userRepositoryStub, 'findOneById').mockResolvedValueOnce(
      UserEntity.create({
        id: 'any_not_owner_user_id',
        name: 'any_not_owner_user_name',
        email: 'any_not_owner_user_email',
        password: 'any_not_owner_user_password',
      }),
    );
    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });
    await expect(promise).rejects.toThrowError(DomainError.UserNotAdminer);
  });

  it('Should throw DomainError.UserAlreadyInGroup if user is adder', async () => {
    const { sut, userRepositoryStub } = makeSut();

    jest
      .spyOn(userRepositoryStub, 'findOneById')
      .mockResolvedValueOnce(mockedUser)
      .mockResolvedValueOnce(mockedOwner);
    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: mockedGroup.owner.id,
      groupId: 'any_group_id',
    });
    await expect(promise).rejects.toThrowError(DomainError.UserAlreadyInGroup);
  });

  it('Should throw DomainError.UserAlreadyInGroup if user already is in group', async () => {
    const { sut, userRepositoryStub, groupRepositoryStub } = makeSut();
    const localMockedGroup = GroupEntity.create({
      ...mockedGroup,
      users: [mockedUser],
    });
    jest
      .spyOn(groupRepositoryStub, 'findById')
      .mockResolvedValueOnce(localMockedGroup);
    jest
      .spyOn(userRepositoryStub, 'findOneById')
      .mockResolvedValueOnce(mockedUser)
      .mockResolvedValueOnce(mockedOwner);
    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: mockedGroup.owner.id,
      groupId: 'any_group_id',
    });
    await expect(promise).rejects.toThrowError(DomainError.UserAlreadyInGroup);
  });

  it('Should throw DomainError.InvalidUser if adder isnt found ', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest
      .spyOn(userRepositoryStub, 'findOneById')
      .mockResolvedValueOnce(mockedUser)
      .mockResolvedValueOnce(null);
    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });
    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.InvalidUser if adder isnt found ', async () => {
    const { sut, groupRepositoryStub } = makeSut();
    jest.spyOn(groupRepositoryStub, 'findById').mockResolvedValueOnce(null);
    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });
    await expect(promise).rejects.toThrowError(DomainError.InvalidGroup);
  });

  it('Should throw DomainError.UserNotFound if user isnt found ', async () => {
    const { sut, userRepositoryStub } = makeSut();
    jest
      .spyOn(userRepositoryStub, 'findOneById')
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
    const { sut, userRepositoryStub } = makeSut();
    jest
      .spyOn(userRepositoryStub, 'findOneById')
      .mockRejectedValueOnce(new Error());
    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });
    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw DomainError.Unexpected if user isnt groupRepositoryRepository.findOneById throws ', async () => {
    const { sut, groupRepositoryStub } = makeSut();
    jest
      .spyOn(groupRepositoryStub, 'findById')
      .mockRejectedValueOnce(new Error());
    const promise = sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });
    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should return a group without messages on succeed ', async () => {
    const { sut, userRepositoryStub, groupRepositoryStub } = makeSut();
    jest
      .spyOn(userRepositoryStub, 'findOneById')
      .mockResolvedValueOnce(mockedUser)
      .mockResolvedValueOnce(mockedOwner);
    const localGroupMock = GroupEntity.create({
      ...mockedGroup,
      users: [],
    });
    jest
      .spyOn(groupRepositoryStub, 'findById')
      .mockResolvedValueOnce(localGroupMock);
    const group = await sut.execute({
      userId: 'any_user_id',
      adderId: 'any_not_owner_user_id',
      groupId: 'any_group_id',
    });
    localGroupMock.users.push(mockedUser);
    expect(group).toEqual(localGroupMock);
  });
});
