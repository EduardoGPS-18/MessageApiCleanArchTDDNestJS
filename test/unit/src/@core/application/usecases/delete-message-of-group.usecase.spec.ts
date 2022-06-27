import {
  DeleteMessageUseCase,
  DeleteMessageUseCaseI,
} from '@application/usecases';
import {
  GroupRepositoryStub,
  MessageRepositoryStub,
  UserRepositoryStub,
} from '@domain-unit/mocks';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError, RepositoryError } from '@domain/errors';

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

const group = GroupEntity.create({
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

const user = UserEntity.create({
  id: 'any_owner_id',
  email: 'any_owner_email',
  name: 'any_owner_name',
  password: 'any_owner_password',
});

type SutTypes = {
  sut: DeleteMessageUseCaseI;
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

  userRepository.findOneById = jest.fn().mockResolvedValue(user);
  groupRepository.findById = jest.fn().mockResolvedValue(group);
  messageRepository.findById = jest.fn().mockResolvedValue(mockedMsg);

  return {
    sut,
    userRepository,
    groupRepository,
    messageRepository,
  };
};

describe('DeleteMessageOfGroup || UseCase || Suit', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, userRepository, groupRepository, messageRepository } =
      makeSut();

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

    await sut.execute({
      groupId: 'any_group_id',
      currentUserId: 'another_user_id',
      messageId: 'any_message_id',
    });

    expect(messageRepository.delete).toBeCalledWith(mockedMsg);
  });
});
