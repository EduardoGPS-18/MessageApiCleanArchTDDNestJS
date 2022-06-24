import { EditMessageUseCase } from '@application/usecases';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError, RepositoryError } from '@domain/errors';
import { MessageRepository, UserRepository } from '@domain/repositories';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

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
  update(message: MessageEntity): Promise<void> {
    return;
  }

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
  userRepository: UserRepositoryStub;
  messageRepository: MessageRepositoryStub;
  sut: EditMessageUseCase;
};
const makeSut = (): SutTypes => {
  const userRepository = new UserRepositoryStub();
  const messageRepository = new MessageRepositoryStub();
  const sut = new EditMessageUseCase(userRepository, messageRepository);
  return { sut, messageRepository, userRepository };
};

describe('EditMessage UseCase (SUIT)', () => {
  it('Should call repository correctly', async () => {
    const { sut, userRepository, messageRepository } = makeSut();

    jest.spyOn(userRepository, 'findOneById');
    jest.spyOn(messageRepository, 'findById');
    jest.spyOn(messageRepository, 'update');

    const newMessageContent = 'any_new_message_content';
    await sut.execute({
      messageId: 'any_message_id',
      currentUserId: 'any_current_user_id',
      newMessageContent: newMessageContent,
    });

    expect(messageRepository.findById).toBeCalledWith('any_message_id');
    expect(messageRepository.update).toBeCalledWith({
      ...mockedMsg,
      content: newMessageContent,
    });
    expect(userRepository.findOneById).toBeCalledWith('any_current_user_id');
  });

  it('Should throw UserIsntMessageOwner if user isnt message owner', async () => {
    const { sut, userRepository } = makeSut();

    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
      Promise.resolve(
        UserEntity.create({
          id: 'another_user_id',
          email: 'another_user_email',
          name: 'another_user_name',
          password: 'another_user_password',
        }),
      ),
    );

    const promise = sut.execute({
      messageId: 'any_message_id',
      currentUserId: 'another_user_id',
      newMessageContent: 'any_new_message_content',
    });

    await expect(promise).rejects.toThrowError(
      DomainError.CurrentUserIsntMessageOwner,
    );
  });

  it('Should throw Unexpected if user messageRepository throws RepositoryError.OperationError', async () => {
    const { sut, messageRepository } = makeSut();

    jest
      .spyOn(messageRepository, 'findById')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      messageId: 'any_message_id',
      currentUserId: 'another_user_id',
      newMessageContent: 'any_new_message_content',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw Unexpected if user userRepository throws RepositoryError.OperationError', async () => {
    const { sut, userRepository } = makeSut();

    jest
      .spyOn(userRepository, 'findOneById')
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      messageId: 'any_message_id',
      currentUserId: 'another_user_id',
      newMessageContent: 'any_new_message_content',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should return message on process succeed', async () => {
    const { sut } = makeSut();

    const newMessageContent = 'any_new_message_content';
    const message = await sut.execute({
      messageId: 'any_message_id',
      currentUserId: 'another_user_id',
      newMessageContent: newMessageContent,
    });

    expect(message).toEqual(
      MessageEntity.create({
        ...mockedMsg,
        content: newMessageContent,
      }),
    );
  });
});
