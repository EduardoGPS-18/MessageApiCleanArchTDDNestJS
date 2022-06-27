import { EditMessageUseCase } from '@application/usecases';
import { MessageRepositoryStub, UserRepositoryStub } from '@domain-unit/mocks';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError, RepositoryError } from '@domain/errors';

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

const owner = UserEntity.create({
  id: 'any_owner_id',
  email: 'any_owner_email',
  name: 'any_owner_name',
  password: 'any_owner_password',
});

const anotherUser = UserEntity.create({
  id: 'another_user_id',
  email: 'another_user_email',
  name: 'another_user_name',
  password: 'another_user_password',
});

type SutTypes = {
  userRepository: UserRepositoryStub;
  messageRepository: MessageRepositoryStub;
  sut: EditMessageUseCase;
};
const makeSut = (): SutTypes => {
  const userRepository = new UserRepositoryStub();
  const messageRepository = new MessageRepositoryStub();
  const sut = new EditMessageUseCase(userRepository, messageRepository);

  userRepository.findOneById = jest.fn().mockResolvedValue(owner);
  messageRepository.findById = jest.fn().mockResolvedValue(mockedMsg);

  return { sut, messageRepository, userRepository };
};

describe('EditMessage || UseCase || Suit', () => {
  it('Should call repository correctly', async () => {
    const { sut, userRepository, messageRepository } = makeSut();
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
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(anotherUser);

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
