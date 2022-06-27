import { DeleteMessageUseCaseStub } from '@application-unit/mocks/usecases';
import { DeleteMessageUseCaseI } from '@application/usecases';
import { UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { DeleteMessageGateway } from '@presentation/gateways';

import { Socket } from 'socket.io-client';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const currentUserClient: Socket = {
  emit: jest.fn(),
} as any;

const currentUserEntity: UserEntity = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
});

const deletedMockDto = {
  groupId: 'any_group_id',
  messageId: 'any_message_id',
};

type SutTypes = {
  sut: DeleteMessageGateway;
  deleteMessageUseCase: DeleteMessageUseCaseI;
};
const makeSut = (): SutTypes => {
  const deleteMessageUseCase = new DeleteMessageUseCaseStub();
  const sut = new DeleteMessageGateway(deleteMessageUseCase);

  sut.server = {
    in: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  } as any;

  return { sut, deleteMessageUseCase };
};

describe('DeleteMessage || Gateway || Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut, deleteMessageUseCase } = makeSut();

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(deleteMessageUseCase.execute).toBeCalledWith({
      currentUserId: currentUserEntity.id,
      groupId: 'any_group_id',
      messageId: 'any_message_id',
    });
  });

  it('Should emit Unauthorized on InvalidUser', async () => {
    const { sut, deleteMessageUseCase } = makeSut();
    jest
      .spyOn(deleteMessageUseCase, 'execute')
      .mockRejectedValue(new DomainError.InvalidUser());

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(currentUserClient.emit).toBeCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Unauthorized',
    });
  });

  it('Should emit error with text Unauthorized on CurrentUserIsntMessageOwner', async () => {
    const { sut, deleteMessageUseCase } = makeSut();
    jest
      .spyOn(deleteMessageUseCase, 'execute')
      .mockRejectedValue(new DomainError.CurrentUserIsntMessageOwner());

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(currentUserClient.emit).toBeCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Unauthorized',
    });
  });

  it('Should emit error with text Invalid Sended Arguments on InvalidGroup', async () => {
    const { sut, deleteMessageUseCase } = makeSut();
    jest
      .spyOn(deleteMessageUseCase, 'execute')
      .mockRejectedValue(new DomainError.InvalidGroup());

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(currentUserClient.emit).toBeCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });

  it('Should emit error with text Invalid Sended Arguments on InvalidMessage', async () => {
    const { sut, deleteMessageUseCase } = makeSut();
    jest
      .spyOn(deleteMessageUseCase, 'execute')
      .mockRejectedValue(new DomainError.InvalidMessage());

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(currentUserClient.emit).toBeCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Invalid sended arguments',
    });
  });

  it('Should emit error with text Invalid Server Exception on Unexpected', async () => {
    const { sut, deleteMessageUseCase } = makeSut();
    jest
      .spyOn(deleteMessageUseCase, 'execute')
      .mockRejectedValue(new DomainError.Unexpected());

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(currentUserClient.emit).toBeCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Internal server exception',
    });
  });

  it('Should emit error with text Invalid Server Exception unmapped error', async () => {
    const { sut, deleteMessageUseCase } = makeSut();
    jest.spyOn(deleteMessageUseCase, 'execute').mockRejectedValue(new Error());

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );
    expect(currentUserClient.emit).toBeCalledTimes(1);
    expect(currentUserClient.emit).toBeCalledWith('error', {
      error: 'Internal server exception',
    });
  });

  it('Should emit event remove-message with messageId on body on result succceed', async () => {
    const { sut } = makeSut();

    await sut.handle(
      deletedMockDto,
      currentUserEntity,
      currentUserClient as any,
    );

    expect(sut.server.in).toBeCalledWith('any_group_id');
    expect(sut.server.in('any_group').emit).toBeCalledWith('remove-message', {
      messageId: 'any_message_id',
    });
  });
});
