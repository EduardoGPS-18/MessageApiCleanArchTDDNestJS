import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GetGroupMessageListController } from '.';
import {
  GetGroupMessageListUseCaseI,
  GetGroupMessageProps,
} from '../../../../application/usecases/get-group-messages';
import {
  GroupEntity,
  MessageEntity,
  UserEntity,
} from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const mockedGroup = GroupEntity.create({
  description: 'any_description',
  id: 'any_group_id',
  name: 'any_group_name',
  messages: [],
  users: [],
  owner: UserEntity.create({
    id: 'any_owner_id',
    email: 'any_owner_email',
    name: 'any_owner_name',
    password: 'any_owner_password',
  }),
});

const currentUserMock = UserEntity.create({
  email: 'any_mail',
  id: 'any_id',
  name: 'any_name',
  password: 'any_password',
});

class GetGroupMessageListUseCaseStub implements GetGroupMessageListUseCaseI {
  async execute({ groupId }: GetGroupMessageProps): Promise<MessageEntity[]> {
    return [
      MessageEntity.create({
        id: 'any_message_id_1',
        content: 'any_message_content_1',
        sender: UserEntity.create({
          id: 'any_owner_id',
          email: 'any_owner_email',
          name: 'any_owner_name',
          password: 'any_owner_password',
        }),
        group: mockedGroup,
      }),
      MessageEntity.create({
        id: 'any_message_id_2',
        content: 'any_message_content_2',
        sender: UserEntity.create({
          id: 'any_owner_id',
          email: 'any_owner_email',
          name: 'any_owner_name',
          password: 'any_owner_password',
        }),
        group: mockedGroup,
      }),
    ];
  }
}

type SutTypes = {
  getGroupMessagesStub: GetGroupMessageListUseCaseStub;
  sut: GetGroupMessageListController;
};
const makeSut = (): SutTypes => {
  const getGroupMessagesStub = new GetGroupMessageListUseCaseStub();
  const sut = new GetGroupMessageListController(getGroupMessagesStub);
  return { sut, getGroupMessagesStub };
};

describe('Get Group Messages Controller Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, getGroupMessagesStub } = makeSut();

    jest.spyOn(getGroupMessagesStub, 'execute');

    await sut.handle(currentUserMock, { groupId: 'any_group_id' });

    expect(getGroupMessagesStub.execute).toHaveBeenCalledWith({
      groupId: 'any_group_id',
      userId: 'any_id',
    });
  });

  it('Should throw Forbidden if usecase throw DomainError.UserInstInGroup', async () => {
    const { sut, getGroupMessagesStub } = makeSut();
    jest
      .spyOn(getGroupMessagesStub, 'execute')
      .mockRejectedValueOnce(new DomainError.UserIsntInGroup());

    const promise = sut.handle(currentUserMock, { groupId: 'any_group_id' });

    await expect(promise).rejects.toThrow(ForbiddenException);
  });

  it('Should throw Forbidden if usecase throw DomainError.InvalidUser', async () => {
    const { sut, getGroupMessagesStub } = makeSut();
    jest
      .spyOn(getGroupMessagesStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());

    const promise = sut.handle(currentUserMock, { groupId: 'any_group_id' });

    await expect(promise).rejects.toThrow(ForbiddenException);
  });

  it('Should throw BadRequest on DomainError.InvalidGroup', async () => {
    const { sut, getGroupMessagesStub } = makeSut();
    jest
      .spyOn(getGroupMessagesStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidGroup());

    const promise = sut.handle(currentUserMock, { groupId: 'any_group_id' });

    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it('Should a list of message on succeed', async () => {
    const { sut } = makeSut();

    const messages = await sut.handle(currentUserMock, {
      groupId: 'any_group_id',
    });

    expect(messages).toEqual([
      {
        id: 'any_message_id_1',
        content: 'any_message_content_1',
        sendDate: new Date('2020-01-01'),
        sender: {
          id: 'any_owner_id',
          email: 'any_owner_email',
          name: 'any_owner_name',
        },
      },
      {
        id: 'any_message_id_2',
        content: 'any_message_content_2',
        sendDate: new Date('2020-01-01'),
        sender: {
          id: 'any_owner_id',
          email: 'any_owner_email',
          name: 'any_owner_name',
        },
      },
    ]);
  });
});
