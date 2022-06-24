import { GetUserGroupListUseCase } from '@application/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { GroupRepository, UserRepository } from '@domain/repositories';
const userInGroup = UserEntity.create({
  email: 'any_mail',
  id: 'any_id',
  name: 'any_name',
  password: 'any_password',
});
const mockedGroup = GroupEntity.create({
  description: 'any_description',
  id: 'any_group_id',
  name: 'any_group_name',
  messages: [],
  users: [userInGroup],
  owner: UserEntity.create({
    id: 'any_owner_id',
    email: 'any_owner_email',
    name: 'any_owner_name',
    password: 'any_owner_password',
  }),
});

class UserRepositoryStub implements UserRepository {
  insert(user: UserEntity): Promise<void> {
    return;
  }
  update(user: UserEntity): Promise<void> {
    return;
  }
  async findOneById(id: string): Promise<UserEntity> {
    return userInGroup;
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return;
  }
  findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    return;
  }
}

class GroupRepositoryStub implements GroupRepository {
  async findByUser(user: UserEntity): Promise<GroupEntity[]> {
    return [mockedGroup, mockedGroup];
  }
  insert(group: GroupEntity): Promise<void> {
    return;
  }
  update(group: GroupEntity): Promise<void> {
    return;
  }
  async findById(id: string): Promise<GroupEntity> {
    return;
  }
}

type SutTypes = {
  sut: GetUserGroupListUseCase;
  userRepository: UserRepositoryStub;
  groupRepository: GroupRepositoryStub;
};
const makeSut = (): SutTypes => {
  const groupRepository = new GroupRepositoryStub();
  const userRepository = new UserRepositoryStub();
  const sut = new GetUserGroupListUseCase(userRepository, groupRepository);
  return { sut, groupRepository, userRepository };
};

describe('GetUserGroupList || UseCase || SUIT', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, userRepository, groupRepository } = makeSut();

    jest.spyOn(groupRepository, 'findByUser');
    jest.spyOn(userRepository, 'findOneById');

    await sut.execute({
      userId: 'any_user_id',
    });

    expect(userRepository.findOneById).toBeCalledWith('any_user_id');
    expect(groupRepository.findByUser).toBeCalledWith(userInGroup);
  });

  it('Should throw InvalidUser if user isnt found', async () => {
    const { sut, userRepository } = makeSut();

    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(null);

    const promise = sut.execute({
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw Unexpected if userRepository throws', async () => {
    const { sut, userRepository } = makeSut();

    jest
      .spyOn(userRepository, 'findOneById')
      .mockRejectedValueOnce(new Error());

    const promise = sut.execute({
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw Unexpected if groupRepository throws', async () => {
    const { sut, groupRepository } = makeSut();

    jest
      .spyOn(groupRepository, 'findByUser')
      .mockRejectedValueOnce(new Error());

    const promise = sut.execute({
      userId: 'any_user_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should return a list of groups on success', async () => {
    const { sut } = makeSut();

    const groups = await sut.execute({
      userId: 'any_user_id',
    });

    expect(groups).toEqual([mockedGroup, mockedGroup]);
  });
});
