import { GetGroupMessageListUseCase } from '.';
import {
  GroupEntity,
  MessageEntity,
  UserEntity,
} from '../../../domain/entities';
import { DomainError } from '../../../domain/errors/domain.error';
import { RepositoryError } from '../../../domain/errors/repository.error';
import {
  GroupRepository,
  MessageRepository,
  UserRepository,
} from '../../../domain/repositories';

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

class MessageRepositoryStub implements MessageRepository {
  findById(id: string): Promise<MessageEntity> {
    return;
  }
  delete(message: MessageEntity): Promise<void> {
    return;
  }
  insert(message: MessageEntity): Promise<void> {
    return;
  }
  async findByGroup(group: GroupEntity): Promise<MessageEntity[]> {
    return [
      MessageEntity.create({
        content: 'any_content_1',
        id: 'any_id_1',
        sender: UserEntity.create({
          email: 'any_sender_mail',
          id: 'any_sender_id',
          name: 'any_sender_name',
          password: 'any_sender_password',
        }),
        group: mockedGroup,
      }),
      MessageEntity.create({
        content: 'any_content_2',
        id: 'any_id_2',
        sender: UserEntity.create({
          email: 'any_sender_mail',
          id: 'any_sender_id',
          name: 'any_sender_name',
          password: 'any_sender_password',
        }),
        group: mockedGroup,
      }),
    ];
  }
}

type SutTypes = {
  sut: GetGroupMessageListUseCase;
  groupRepositoryStub: GroupRepositoryStub;
  messageRepositoryStub: MessageRepositoryStub;
  userRepositoryStub: UserRepositoryStub;
  currentUser: UserEntity;
};
const makeSut = (): SutTypes => {
  const groupRepositoryStub = new GroupRepositoryStub();
  const messageRepositoryStub = new MessageRepositoryStub();
  const userRepositoryStub = new UserRepositoryStub();
  const currentUser = userInGroup;
  const sut = new GetGroupMessageListUseCase(
    groupRepositoryStub,
    messageRepositoryStub,
    userRepositoryStub,
  );
  return {
    sut,
    messageRepositoryStub,
    groupRepositoryStub,
    userRepositoryStub,
    currentUser,
  };
};
describe('Get Group Messages', () => {
  it('Should call correctly dependencies', async () => {
    const { sut, groupRepositoryStub, messageRepositoryStub, currentUser } =
      makeSut();
    jest.spyOn(groupRepositoryStub, 'findById');
    jest.spyOn(messageRepositoryStub, 'findByGroup');

    await sut.execute({ groupId: 'any_group_id', userId: currentUser.id });

    expect(groupRepositoryStub.findById).toHaveBeenCalledWith('any_group_id');
    expect(messageRepositoryStub.findByGroup).toHaveBeenCalledWith(mockedGroup);
  });

  it('Should throw DomainError.InvalidGroup if group not found', async () => {
    const { sut, groupRepositoryStub, currentUser } = makeSut();
    jest.spyOn(groupRepositoryStub, 'findById').mockResolvedValueOnce(null);

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: currentUser.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidGroup);
  });

  it('Should throw DomainError.UserIsntInGroup if user isnt in group', async () => {
    const { sut, userRepositoryStub } = makeSut();
    const currentUser = UserEntity.create({
      email: 'user_out_of_group_email',
      id: 'user_out_of_group_id',
      name: 'user_out_of_group_name',
      password: 'user_out_of_group_password',
    });
    jest
      .spyOn(userRepositoryStub, 'findOneById')
      .mockResolvedValueOnce(currentUser);
    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: currentUser.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.UserIsntInGroup);
  });

  it('Should throw DomainError.InvalidUser if user isnt found', async () => {
    const { sut, userRepositoryStub } = makeSut();

    jest.spyOn(userRepositoryStub, 'findOneById').mockResolvedValueOnce(null);
    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: '',
    });
    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.Unexpected if groupRepository throws RepositoryError.OperationError not found', async () => {
    const { sut, groupRepositoryStub, currentUser } = makeSut();
    jest
      .spyOn(groupRepositoryStub, 'findById')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: currentUser.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw DomainError.Unexpected if messageRepository throws RepositoryError.OperationError not found', async () => {
    const { sut, messageRepositoryStub, currentUser } = makeSut();
    jest
      .spyOn(messageRepositoryStub, 'findByGroup')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: currentUser.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should return messages on operation success', async () => {
    const { sut, currentUser } = makeSut();

    const messages = await sut.execute({
      groupId: 'any_group_id',
      userId: currentUser.id,
    });

    expect(messages).toEqual([
      MessageEntity.create({
        content: 'any_content_1',
        id: 'any_id_1',
        sender: UserEntity.create({
          email: 'any_sender_mail',
          id: 'any_sender_id',
          name: 'any_sender_name',
          password: 'any_sender_password',
        }),
        group: mockedGroup,
      }),
      MessageEntity.create({
        content: 'any_content_2',
        id: 'any_id_2',
        sender: UserEntity.create({
          email: 'any_sender_mail',
          id: 'any_sender_id',
          name: 'any_sender_name',
          password: 'any_sender_password',
        }),
        group: mockedGroup,
      }),
    ]);
  });
});
