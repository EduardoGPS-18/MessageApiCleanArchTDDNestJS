import { SendMessageToGroupUseCase } from '@application/usecases';
import {
  GroupRepositoryStub,
  MessageRepositoryStub,
  UserRepositoryStub,
} from '@domain-unit/mocks';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import * as crypto from 'crypto';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

jest.mock('crypto');
jest.spyOn(crypto, 'randomUUID').mockReturnValue('gen_uuid');

const user = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
});

const userOutOfGroup = UserEntity.create({
  id: 'sender_out_of_group_id',
  email: 'sender_out_of_group_email',
  name: 'sender_out_of_group_name',
  password: 'sender_out_of_group_pass',
});

const owner = UserEntity.create({
  id: 'owner_id',
  email: 'owner_email',
  name: 'owner_name',
  password: 'owner_password',
});

const group = GroupEntity.create({
  id: 'any_group',
  name: 'any_name',
  description: 'any_description',
  owner: owner,
  messages: [],
  users: [],
});

const message = MessageEntity.create({
  group: GroupEntity.create({
    id: 'any_group',
    description: 'any_description',
    messages: [],
    name: 'any_name',
    owner: owner,
    users: [],
  }),
  content: 'any_message',
  id: 'gen_uuid',
  sender: owner,
});

type SutTypes = {
  groupRepository: GroupRepositoryStub;
  userRepository: UserRepositoryStub;
  messageRepository: MessageRepositoryStub;
  sut: SendMessageToGroupUseCase;
};
const makeSut = (): SutTypes => {
  const groupRepository = new GroupRepositoryStub();
  const userRepository = new UserRepositoryStub();
  const messageRepository = new MessageRepositoryStub();
  const sut = new SendMessageToGroupUseCase(
    groupRepository,
    userRepository,
    messageRepository,
  );

  userRepository.findOneById = jest.fn().mockResolvedValue(owner);
  groupRepository.findById = jest.fn().mockResolvedValue(group);

  return { sut, groupRepository, userRepository, messageRepository };
};
describe('SendMessageToGroup || Usecase || Suit', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, groupRepository, userRepository, messageRepository } =
      makeSut();

    await sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group',
      senderId: 'owner_id',
    });

    expect(groupRepository.findById).toHaveBeenCalledWith('any_group');
    expect(userRepository.findOneById).toHaveBeenCalledWith('owner_id');
    expect(messageRepository.insert).toHaveBeenCalledWith(message);
  });

  it('Should throw if sender isnt in group', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockResolvedValueOnce(userOutOfGroup);

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.UserIsntInGroup);
  });

  it('Should throw InvalidUser if sender isnt valid', async () => {
    const { sut, userRepository } = makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(null);

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw InvalidGroup if group isnt valid', async () => {
    const { sut, groupRepository } = makeSut();
    groupRepository.findById = jest.fn().mockResolvedValueOnce(null);

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidGroup);
  });

  it('Should throw DomainError.Unexpected to another groupRepository.repository error', async () => {
    const { sut, groupRepository } = makeSut();
    jest.spyOn(groupRepository, 'findById').mockRejectedValueOnce(new Error());

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should throw DomainError.Unexpected to another userRepository.repository error', async () => {
    const { sut, userRepository } = makeSut();
    jest
      .spyOn(userRepository, 'findOneById')
      .mockRejectedValueOnce(new Error());

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  });

  it('Should add message to a group on operation succeed', async () => {
    const { sut } = makeSut();

    const message = await sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    expect(message).toEqual(
      MessageEntity.create({
        id: 'gen_uuid',
        content: 'any_message',
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: owner,
          users: [],
        }),
        sender: owner,
      }),
    );
  });

  it('Should rethrow if message creation throw', async () => {
    const { sut } = makeSut();

    const promise = sut.execute({
      messageContent: '',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidMessage);
  });
});
