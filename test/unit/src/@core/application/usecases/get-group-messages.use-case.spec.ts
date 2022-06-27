import { GetGroupMessageListUseCase } from '@application/usecases';
import {
  GroupRepositoryStub,
  MessageRepositoryStub,
  UserRepositoryStub,
} from '@domain-unit/mocks';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError, RepositoryError } from '@domain/errors';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedUserInGroup = UserEntity.create({
  email: 'any_mail',
  id: 'any_id',
  name: 'any_name',
  password: 'any_password',
});

const mockedUserOutOfGroup = UserEntity.create({
  email: 'user_out_of_group_email',
  id: 'user_out_of_group_id',
  name: 'user_out_of_group_name',
  password: 'user_out_of_group_password',
});

const mockedGroup = GroupEntity.create({
  description: 'any_description',
  id: 'any_group_id',
  name: 'any_group_name',
  messages: [],
  users: [mockedUserInGroup],
  owner: UserEntity.create({
    id: 'any_owner_id',
    email: 'any_owner_email',
    name: 'any_owner_name',
    password: 'any_owner_password',
  }),
});

const mockedFirstMessage = MessageEntity.create({
  content: 'any_content_1',
  id: 'any_id_1',
  sender: UserEntity.create({
    email: 'any_sender_mail',
    id: 'any_sender_id',
    name: 'any_sender_name',
    password: 'any_sender_password',
  }),
  group: mockedGroup,
});

const mockedSecondMessage = MessageEntity.create({
  content: 'any_content_2',
  id: 'any_id_2',
  sender: UserEntity.create({
    email: 'any_sender_mail',
    id: 'any_sender_id',
    name: 'any_sender_name',
    password: 'any_sender_password',
  }),
  group: mockedGroup,
});

type SutTypes = {
  sut: GetGroupMessageListUseCase;
  groupRepository: GroupRepositoryStub;
  messageRepository: MessageRepositoryStub;
  userRepository: UserRepositoryStub;
};
const makeSut = (): SutTypes => {
  const groupRepository = new GroupRepositoryStub();
  const messageRepository = new MessageRepositoryStub();
  const userRepository = new UserRepositoryStub();

  const sut = new GetGroupMessageListUseCase(
    groupRepository,
    messageRepository,
    userRepository,
  );

  messageRepository.findByGroup = jest
    .fn()
    .mockResolvedValue([mockedFirstMessage, mockedSecondMessage]);
  userRepository.findOneById = jest.fn().mockResolvedValue(mockedUserInGroup);
  groupRepository.findById = jest.fn().mockResolvedValue(mockedGroup);

  return { sut, messageRepository, groupRepository, userRepository };
};

describe('GetGroupMessages || UseCase || Suit', () => {
  it('Should call correctly dependencies', async () => {
    const { sut, groupRepository, messageRepository } = makeSut();

    await sut.execute({
      groupId: 'any_group_id',
      userId: mockedUserInGroup.id,
    });

    expect(groupRepository.findById).toHaveBeenCalledWith('any_group_id');
    expect(messageRepository.findByGroup).toHaveBeenCalledWith(mockedGroup);
  });

  it('Should throw DomainError.InvalidGroup if group not found', async () => {
    const { sut, groupRepository } = makeSut();
    groupRepository.findById = jest.fn().mockResolvedValueOnce(null);

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: mockedUserInGroup.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidGroup);
  });

  it('Should throw DomainError.UserIsntInGroup if user isnt in group', async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findOneById = jest
      .fn()
      .mockResolvedValueOnce(mockedUserOutOfGroup);

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: mockedUserOutOfGroup.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.UserIsntInGroup);
  });

  it('Should throw DomainError.InvalidUser if user isnt found', async () => {
    const { sut, userRepository } = makeSut();
    userRepository.findOneById = jest.fn().mockResolvedValueOnce(null);

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: '',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw DomainError.Unexpected if groupRepository throws RepositoryError.OperationError not found', async () => {
    const { sut, groupRepository } = makeSut();
    groupRepository.findById = jest
      .fn()
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: mockedUserInGroup.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw DomainError.Unexpected if messageRepository throws RepositoryError.OperationError not found', async () => {
    const { sut, messageRepository } = makeSut();
    messageRepository.findByGroup = jest
      .fn()
      .mockRejectedValueOnce(new RepositoryError.OperationError());

    const promise = sut.execute({
      groupId: 'any_group_id',
      userId: mockedUserInGroup.id,
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should return messages on operation success', async () => {
    const { sut } = makeSut();

    const messages = await sut.execute({
      groupId: 'any_group_id',
      userId: mockedUserInGroup.id,
    });

    expect(messages).toEqual([mockedFirstMessage, mockedSecondMessage]);
  });
});
