import { EditMessageUseCaseStub } from '@application-unit/mocks/usecases';
import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { EditMessageDto } from '@presentation/dtos';
import { EditMessageGateway } from '@presentation/gateways';
import { Socket } from 'socket.io';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedUser = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
});

const mockedGroup = GroupEntity.create({
  id: 'any_group_id',
  description: 'any_group_description',
  messages: [],
  name: 'any_group_name',
  owner: mockedUser,
  users: [],
});

const mockedMessage = MessageEntity.create({
  content: 'update_message',
  id: 'any_message_id',
  sender: mockedUser,
  group: mockedGroup,
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

const mockedEditMessageDto: EditMessageDto = {
  newMessageContent: 'new_message_content',
  groupId: 'any_group_id',
  messageId: 'any_message_id',
};

type SutTypes = {
  sut: EditMessageGateway;
  editMessageUseCase: EditMessageUseCaseStub;
};
const makeSut = (): SutTypes => {
  const editMessageUseCase = new EditMessageUseCaseStub();
  const sut = new EditMessageGateway(editMessageUseCase);

  editMessageUseCase.execute = jest.fn().mockResolvedValue(mockedMessage);

  sut.server = {
    in: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  } as any;

  return { sut, editMessageUseCase };
};

describe('EditMessage || Gateway || Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, editMessageUseCase } = makeSut();

    await sut.handle(
      mockedEditMessageDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(editMessageUseCase.execute).toBeCalledWith({
      messageId: 'any_message_id',
      newMessageContent: 'new_message_content',
      currentUserId: currentUserEntity.id,
    });
  });

  it('Should emit error with text Unauthorized to client when usecase throws CurrentUserIsntMessageOwner', async () => {
    const { sut, editMessageUseCase } = makeSut();
    jest
      .spyOn(editMessageUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.CurrentUserIsntMessageOwner());

    await sut.handle(
      mockedEditMessageDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(currentUserClient.emit).toBeCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Unauthorized',
    });
  });

  it('Should emit error with text Server error to client when usecase throws Unexpected', async () => {
    const { sut, editMessageUseCase } = makeSut();
    jest
      .spyOn(editMessageUseCase, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());

    await sut.handle(
      mockedEditMessageDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Server error',
    });
  });

  it('Should emit to room new message on success ', async () => {
    const { sut } = makeSut();

    await sut.handle(
      mockedEditMessageDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(sut.server.in).toBeCalledWith('any_group_id');
    expect(sut.server.in('any').emit).toBeCalledWith('updated_message', {
      message: {
        content: 'update_message',
        id: 'any_message_id',
        sender: {
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
        },
        groupId: 'any_group_id',
        sendDate: new Date(),
      },
    });
  });
});
