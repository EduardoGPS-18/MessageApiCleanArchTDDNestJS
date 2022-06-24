import {
  SendMessageToGroupProps,
  SendMessageToGroupUseCaseI,
} from '@application/usecases';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { SendMessageGateway } from '@presentation/gateways';
import { Socket } from 'socket.io';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const socket: Socket = jest.genMockFromModule('socket.io-client');

class SendMessageToGroupUseCaseStub implements SendMessageToGroupUseCaseI {
  async execute(props: SendMessageToGroupProps): Promise<MessageEntity> {
    return MessageEntity.create({
      content: 'any_content',
      group: GroupEntity.create({
        id: 'any_group_id',
        description: 'any_group_description',
        messages: [],
        name: 'any_group_name',
        owner: UserEntity.create({
          email: 'any_user_email',
          id: 'any_user_id',
          name: 'any_user_name',
          password: 'any_user_password',
        }),
        users: [],
      }),
      id: 'any_message_id',
      sender: UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
    });
  }
}

type SutTypes = {
  sut: SendMessageGateway;
  currentUserEntity: UserEntity;
  currentUserClient: Socket;
  sendMessageToGroupUseCaseStub: SendMessageToGroupUseCaseI;
};
const makeSut = (): SutTypes => {
  const sendMessageToGroupUseCaseStub = new SendMessageToGroupUseCaseStub();
  const sut = new SendMessageGateway(sendMessageToGroupUseCaseStub);
  sut.server = {
    in: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  } as any;
  const currentUserClient: Socket = {
    emit: jest.fn(),
  } as any;
  const currentUserEntity: UserEntity = UserEntity.create({
    id: 'any_user_id',
    email: 'any_user_email',
    name: 'any_user_name',
    password: 'any_user_password',
  });
  return {
    sut,
    sendMessageToGroupUseCaseStub,
    currentUserClient,
    currentUserEntity,
  };
};
describe('SendMessage Controller', () => {
  beforeEach(() => {
    socket.emit = jest.fn();
  });
  it('Should call dependencies correctly', async () => {
    const { sut, sendMessageToGroupUseCaseStub, currentUserClient } = makeSut();
    jest.spyOn(sendMessageToGroupUseCaseStub, 'execute');
    await sut.handle(
      UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      {
        messageContent: 'any_content',
        groupId: 'any_group_id',
      },
      currentUserClient as any,
    );
    expect(sendMessageToGroupUseCaseStub.execute).toHaveBeenCalledWith({
      messageContent: 'any_content',
      groupId: 'any_group_id',
      senderId: 'any_user_id',
    });
  });
  it('Should emit Error with Invalid Sended Arguments on DomainError.UserIsntInGroup', async () => {
    const { sut, sendMessageToGroupUseCaseStub, currentUserClient } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.UserIsntInGroup());
    await sut.handle(
      UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      {
        messageContent: 'any_content',
        groupId: 'any_group_id',
      },
      currentUserClient as any,
    );
    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });
  it('Should emit Error with Invalid Sended Arguments on DomainError.InvalidUser', async () => {
    const { sut, sendMessageToGroupUseCaseStub, currentUserClient } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());
    await sut.handle(
      UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      {
        messageContent: 'any_content',
        groupId: 'any_group_id',
      },
      currentUserClient as any,
    );
    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });
  it('Should emit Error with Invalid Sended Arguments on DomainError.InvalidGroup', async () => {
    const { sut, sendMessageToGroupUseCaseStub, currentUserClient } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidGroup());
    await sut.handle(
      UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      {
        messageContent: 'any_content',
        groupId: 'any_group_id',
      },
      currentUserClient as any,
    );
    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });
  it('Should emit Error with Invalid Sended Arguments on DomainError.InvalidMessage', async () => {
    const { sut, sendMessageToGroupUseCaseStub, currentUserClient } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidMessage());
    await sut.handle(
      UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      {
        messageContent: 'any_content',
        groupId: 'any_group_id',
      },
      currentUserClient as any,
    );
    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });
  it('Should emit Error with Server Error on another error', async () => {
    const { sut, sendMessageToGroupUseCaseStub, currentUserClient } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new Error());
    await sut.handle(
      UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      {
        messageContent: 'any_content',
        groupId: 'any_group_id',
      },
      currentUserClient as any,
    );
    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Server error',
    });
  });
  it('Should return message on success', async () => {
    const { sut, currentUserClient } = makeSut();
    const message = await sut.handle(
      UserEntity.create({
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      {
        messageContent: 'any_content',
        groupId: 'any_group_id',
      },
      currentUserClient as any,
    );
    expect(message).toEqual({
      id: 'any_message_id',
      content: 'any_content',
      groupId: 'any_group_id',
      sendDate: new Date(),
      sender: {
        email: 'any_user_email',
        id: 'any_user_id',
        name: 'any_user_name',
      },
    });
  });
});
