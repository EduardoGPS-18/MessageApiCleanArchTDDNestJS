import { GetUserGroupListUseCase } from '@application/usecases';
import { GroupRepositoryStub, UserRepositoryStub } from '@domain-unit/mocks';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

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

type SutTypes = {
  sut: GetUserGroupListUseCase;
  userRepository: UserRepositoryStub;
  groupRepository: GroupRepositoryStub;
};
const makeSut = (): SutTypes => {
  const groupRepository = new GroupRepositoryStub();
  const userRepository = new UserRepositoryStub();
  const sut = new GetUserGroupListUseCase(userRepository, groupRepository);

  userRepository.findOneById = jest.fn().mockResolvedValue(userInGroup);
  groupRepository.findByUser = jest
    .fn()
    .mockResolvedValue([mockedGroup, mockedGroup]);

  return { sut, groupRepository, userRepository };
};

describe('GetUserGroupList || UseCase || SUIT', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, userRepository, groupRepository } = makeSut();

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
