import { BadRequestException } from '@nestjs/common';
import {
  SendMessageToGroupProps,
  SendMessageToGroupUseCaseI,
} from '../../../../application/usecases/send-message-to-group';
import {
  GroupEntity,
  MessageEntity,
  UserEntity,
} from '../../../../domain/entities';
import { DomainError } from '../../../../domain/errors/domain.error';
import { SendMessageController } from './send-message.controller';

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
  sut: SendMessageController;
  sendMessageToGroupUseCaseStub: SendMessageToGroupUseCaseI;
};
const makeSut = (): SutTypes => {
  const sendMessageToGroupUseCaseStub = new SendMessageToGroupUseCaseStub();
  const sut = new SendMessageController(sendMessageToGroupUseCaseStub);
  return { sut, sendMessageToGroupUseCaseStub };
};
describe('SendMessage Controller', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
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
    );
    expect(sendMessageToGroupUseCaseStub.execute).toHaveBeenCalledWith({
      messageContent: 'any_content',
      groupId: 'any_group_id',
      senderId: 'any_user_id',
    });
  });

  it('Should throw BadRequest on DomainError.UserIsntInGroup', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.UserIsntInGroup());
    const promise = sut.handle(
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
    );
    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw BadRequest on DomainError.InvalidUser', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());
    const promise = sut.handle(
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
    );
    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw BadRequest on DomainError.InvalidGroup', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidGroup());
    const promise = sut.handle(
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
    );
    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw BadRequest on DomainError.InvalidMessage', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidMessage());
    const promise = sut.handle(
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
    );
    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should throw ServerError on another error', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
    jest
      .spyOn(sendMessageToGroupUseCaseStub, 'execute')
      .mockRejectedValueOnce(new DomainError.UserIsntInGroup());
    const promise = sut.handle(
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
    );
    await expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('Should return message on success', async () => {
    const { sut, sendMessageToGroupUseCaseStub } = makeSut();
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
    );
    expect(message).toEqual({
      id: 'any_message_id',
      content: 'any_content',
      groupId: 'any_group_id',
      sendDate: new Date(),
    });
  });
});
