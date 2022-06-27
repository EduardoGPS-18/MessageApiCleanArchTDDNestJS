import { SendMessageToGroupUseCaseStub } from '@application-unit/mocks/usecases';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { SendMessageDto } from '@presentation/dtos';
import { SendMessageGateway } from '@presentation/gateways';
import { Socket } from 'socket.io';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const socket: Socket = jest.genMockFromModule('socket.io-client');

const mockedUser = UserEntity.create({
  password: 'any_user_password',
  email: 'any_user_email',
  name: 'any_user_name',
  id: 'any_user_id',
});

const group = GroupEntity.create({
  description: 'any_group_description',
  name: 'any_group_name',
  id: 'any_group_id',
  owner: mockedUser,
  messages: [],
  users: [],
});

const mockedMessage = MessageEntity.create({
  content: 'any_content',
  id: 'any_message_id',
  sender: mockedUser,
  group: group,
});

const currentUserClient: Socket = {
  emit: jest.fn(),
} as any;

const currentUserEntity: UserEntity = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
});

const sendMessageDto: SendMessageDto = {
  messageContent: 'any_content',
  groupId: 'any_group_id',
};

type SutTypes = {
  sut: SendMessageGateway;
  sendMessageToGroupUseCaseStub: SendMessageToGroupUseCaseStub;
};
const makeSut = (): SutTypes => {
  const sendMessageToGroupUseCaseStub = new SendMessageToGroupUseCaseStub();
  const sut = new SendMessageGateway(sendMessageToGroupUseCaseStub);

  socket.emit = jest.fn();
  sut.server = {
    in: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  } as any;
  sendMessageToGroupUseCaseStub.execute = jest
    .fn()
    .mockResolvedValue(mockedMessage);

  return {
    sut,
    sendMessageToGroupUseCaseStub,
  };
};
describe('SendMessage || Gateway || Suit', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();

    await sut.handle(mockedUser, sendMessageDto, currentUserClient as any);

    expect(sendMessageToGroupUseCaseStub.execute).toHaveBeenCalledWith({
      messageContent: 'any_content',
      groupId: 'any_group_id',
      senderId: 'any_user_id',
    });
  });

  it('Should emit Error with Invalid Sended Arguments on DomainError.UserIsntInGroup', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.UserIsntInGroup());

    await sut.handle(mockedUser, sendMessageDto, currentUserClient as any);

    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });
  it('Should emit Error with Invalid Sended Arguments on DomainError.InvalidUser', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());

    await sut.handle(mockedUser, sendMessageDto, currentUserClient as any);

    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });

  it('Should emit Error with Invalid Sended Arguments on DomainError.InvalidGroup', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidGroup());

    await sut.handle(mockedUser, sendMessageDto, currentUserClient as any);

    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });

  it('Should emit Error with Invalid Sended Arguments on DomainError.InvalidMessage', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidMessage());

    await sut.handle(mockedUser, sendMessageDto, currentUserClient as any);

    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });

  it('Should emit Error with Server Error on another error', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new Error());

    await sut.handle(mockedUser, sendMessageDto, currentUserClient as any);

    expect(currentUserClient.emit).toHaveBeenCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Server error',
    });
  });

  it('Should return message on success', async () => {
    const { sut } = makeSut();

    const message = await sut.handle(
      mockedUser,
      sendMessageDto,
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
