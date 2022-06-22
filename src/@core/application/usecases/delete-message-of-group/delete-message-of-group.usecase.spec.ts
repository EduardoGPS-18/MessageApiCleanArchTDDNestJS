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
import { DeleteMessageUseCase } from './delete-message-of-group.usecase';

const mockedMsg = MessageEntity.create({
  id: 'any_message_id',
  content: 'any_message_content',
  group: GroupEntity.create({
    id: 'any_group_id',
    description: 'any_group_description',
    messages: [],
    name: 'any_group_name',
    owner: UserEntity.create({
      id: 'any_owner_id',
      email: 'any_owner_email',
      name: 'any_owner_name',
      password: 'any_owner_password',
    }),
    users: [],
  }),
  sender: UserEntity.create({
    id: 'any_owner_id',
    email: 'any_owner_email',
    name: 'any_owner_name',
    password: 'any_owner_password',
  }),
});
class MessageRepositoryStub implements MessageRepository {
  async findById(id: string): Promise<MessageEntity> {
    return mockedMsg;
  }
  delete(message: MessageEntity): Promise<void> {
    return;
  }
  insert(message: MessageEntity): Promise<void> {
    return;
  }
  findByGroup(group: GroupEntity): Promise<MessageEntity[]> {
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
    return GroupEntity.create({
      id: 'any_group_id',
      description: 'any_group_description',
      messages: [],
      name: 'any_group_name',
      owner: UserEntity.create({
        id: 'any_owner_id',
        email: 'any_owner_email',
        name: 'any_owner_name',
        password: 'any_owner_password',
      }),
      users: [],
    });
  }
}

class UserRepositoryStub implements UserRepository {
  insert(user: UserEntity): Promise<void> {
    return;
  }
  update(user: UserEntity): Promise<void> {
    return;
  }
  async findOneById(id: string): Promise<UserEntity> {
    return UserEntity.create({
      id: 'any_owner_id',
      email: 'any_owner_email',
      name: 'any_owner_name',
      password: 'any_owner_password',
    });
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return;
  }
  findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    return;
  }
}
type SutTypes = {
  sut: DeleteMessageUseCase;
  userRepository: UserRepositoryStub;
  groupRepository: GroupRepositoryStub;
  messageRepository: MessageRepositoryStub;
};
const makeSut = (): SutTypes => {
  const messageRepository = new MessageRepositoryStub();
  const groupRepository = new GroupRepositoryStub();
  const userRepository = new UserRepositoryStub();
  const sut = new DeleteMessageUseCase(
    userRepository,
    groupRepository,
    messageRepository,
  );
  return {
    sut,
    userRepository,
    groupRepository,
    messageRepository,
  };
};

describe('Delete message of group suit', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, userRepository, groupRepository, messageRepository } =
      makeSut();

    jest.spyOn(userRepository, 'findOneById');
    jest.spyOn(messageRepository, 'findById');
    jest.spyOn(groupRepository, 'findById');

    await sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'any_owner_id',
      messageId: 'any_message_id',
    });

    expect(userRepository.findOneById).toBeCalledWith('any_owner_id');
    expect(messageRepository.findById).toBeCalledWith('any_message_id');
    expect(groupRepository.findById).toBeCalledWith('any_group_id');
  });

  it('Should throw Unexpected if user repository throws', async () => {
    const { sut, userRepository, groupRepository, messageRepository } =
      makeSut();

    jest
      .spyOn(userRepository, 'findOneById')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'any_owner_id',
      messageId: 'any_message_id',
    });

    await expect(promise).rejects.toThrow(DomainError.Unexpected);
  });

  it('Should throw Unexpected if user repository throws', async () => {
    const { sut, userRepository } = makeSut();

    jest.spyOn(userRepository, 'findOneById').mockResolvedValue(null);

    const promise = sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'any_owner_id',
      messageId: 'any_message_id',
    });

    await expect(promise).rejects.toThrow(DomainError.InvalidUser);
  });

  it('Should throw Unexpected if user repository throws', async () => {
    const { sut, groupRepository } = makeSut();

    jest.spyOn(groupRepository, 'findById').mockResolvedValue(null);

    const promise = sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'any_owner_id',
      messageId: 'any_message_id',
    });

    await expect(promise).rejects.toThrow(DomainError.InvalidGroup);
  });

  it('Should throw Unexpected if user repository throws', async () => {
    const { sut, messageRepository } = makeSut();

    jest.spyOn(messageRepository, 'findById').mockResolvedValue(null);

    const promise = sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'any_owner_id',
      messageId: 'any_message_id',
    });

    await expect(promise).rejects.toThrow(DomainError.InvalidMessage);
  });

  it('Should throw CurrentUserIsntMessageOwner if user isnt message owner', async () => {
    const { sut, userRepository } = makeSut();

    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
      UserEntity.create({
        id: 'another_user_id',
        email: 'another_user_email',
        name: 'another_user_name',
        password: 'another_user_password',
      }),
    );

    const promise = sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'another_user_id',
      messageId: 'any_message_id',
    });

    await expect(promise).rejects.toThrow(
      DomainError.CurrentUserIsntMessageOwner,
    );
  });

  it('Should remove message on success', async () => {
    const { sut, messageRepository } = makeSut();
    jest.spyOn(messageRepository, 'delete');
    await sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'another_user_id',
      messageId: 'any_message_id',
    });
    expect(messageRepository.delete).toBeCalledWith(mockedMsg);
  });
});
