import { ValidateUserProps, ValidateUserUseCaseI } from '@application/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { PresentationHelpers } from '@presentation/helpers/methods';
import { GroupWebSocketProviderGateway } from '@presentation/providers';
import { Socket } from 'socket.io';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

class ValidateUserUseCaseStub implements ValidateUserUseCaseI {
  async execute(props: ValidateUserProps): Promise<UserEntity> {
    return UserEntity.create({
      id: 'any_user_id',
      email: 'any_user_email',
      name: 'any_user_name',
      password: 'any_user_password',
    });
  }
}

type SutTypes = {
  sut: GroupWebSocketProviderGateway;
  validateUser: ValidateUserUseCaseStub;
  currentUserClient: Socket;
};
const makeSut = () => {
  const currentUserClient: Socket = {
    handshake: {
      headers: {
        authorization: 'Bearer any-token',
      },
    },
    emit: jest.fn(),
    data: {
      user: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
    },
    disconnect: jest.fn(),
  } as any;

  PresentationHelpers.addUserToObject = jest.fn();
  const validateUser = new ValidateUserUseCaseStub();
  const sut = new GroupWebSocketProviderGateway(validateUser);

  return { sut, validateUser, currentUserClient };
};

describe('GroupWebSocketProvider || Gateway || SUIT', () => {
  describe('handleConnection', () => {
    it('Should call correctly usecase on connect on socket', async () => {
      const { currentUserClient, sut, validateUser } = makeSut();
      jest.spyOn(validateUser, 'execute');
      await sut.handleConnection(currentUserClient);
      expect(validateUser.execute).toBeCalledWith({
        session: 'any-token',
      });
    });

    it('Should add user on clients on succeed', async () => {
      const { sut, currentUserClient, validateUser } = makeSut();
      jest.spyOn(validateUser, 'execute');

      await sut.handleConnection(currentUserClient);
      expect(sut.clients).toEqual([
        { userId: 'any_user_id', client: currentUserClient },
      ]);
    });

    it('Should disconnect user if no token is provided', async () => {
      const { sut, currentUserClient, validateUser } = makeSut();
      jest.spyOn(validateUser, 'execute');
      const localUserClient = {
        ...currentUserClient,
        handshake: {
          headers: {
            authorization: 'Bearer ',
          },
        },
      } as any;
      await sut.handleConnection(localUserClient);
      expect(currentUserClient.disconnect).toBeCalledTimes(1);
    });

    it('Should disconnect user if validate user throws InvalidUser', async () => {
      const { currentUserClient, sut, validateUser } = makeSut();
      jest
        .spyOn(validateUser, 'execute')
        .mockRejectedValueOnce(new DomainError.InvalidUser());
      await sut.handleConnection(currentUserClient);
      expect(currentUserClient.disconnect).toBeCalledTimes(1);
    });

    it('Should call helper to atach user on client data', async () => {
      const { sut, currentUserClient, validateUser } = makeSut();
      jest.spyOn(validateUser, 'execute');

      await sut.handleConnection(currentUserClient);
      expect(PresentationHelpers.addUserToObject).toBeCalledWith(
        currentUserClient.data.user,
        UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
        }),
      );
    });
  });

  describe('handleDisconnect', () => {
    it('Should remove client from clients', async () => {
      const { sut, currentUserClient, validateUser } = makeSut();
      sut.clients.push({ userId: 'any_user_id', client: currentUserClient });
      jest.spyOn(validateUser, 'execute');

      await sut.handleDisconnect(currentUserClient);
      expect(sut.clients).toEqual([]);
    });
  });

  describe('clientByUserId', () => {
    it('Should return client of userId', () => {
      const { sut, currentUserClient } = makeSut();

      sut.clients.push({
        userId: 'any_user_id',
        client: currentUserClient,
      });

      const client = sut.clientByUserId('any_user_id');
      expect(client).toEqual(currentUserClient);
    });

    it('Should ignore if user isnt a connection', () => {
      const { sut } = makeSut();
      const invocation = () => sut.clientByUserId('any_user_id');
      expect(invocation).not.toThrow(Error);
    });
  });

  describe('emitToUserAddedToGroup', () => {
    const group = GroupEntity.create({
      id: 'any_group_id',
      description: 'any_group_description',
      messages: [],
      name: 'any_group_name',
      owner: UserEntity.create({
        id: 'any_owner_id',
        email: 'any_owner_email',
        name: 'any_owner_name',
        password: 'any_owner_pass',
      }),
      users: [
        UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
        }),
      ],
    });
    it('Should emit to user with current userId', () => {
      const { sut, currentUserClient } = makeSut();
      sut.clients.push({
        userId: 'any_user_id',
        client: currentUserClient,
      });

      sut.emitToUserAddedToGroup('any_user_id', group);
      expect(currentUserClient.emit).toBeCalledWith('added-to-group', {
        id: 'any_group_id',
        description: 'any_group_description',
        users: [
          {
            id: 'any_user_id',
            email: 'any_user_email',
            name: 'any_user_name',
          },
        ],
        name: 'any_group_name',
        owner: {
          id: 'any_owner_id',
          email: 'any_owner_email',
          name: 'any_owner_name',
        },
      });
    });
  });

  describe('emitToUserRemovedFromGroup', () => {
    const group = GroupEntity.create({
      id: 'any_group_id',
      description: 'any_group_description',
      messages: [],
      name: 'any_group_name',
      owner: UserEntity.create({
        id: 'any_owner_id',
        email: 'any_owner_email',
        name: 'any_owner_name',
        password: 'any_owner_pass',
      }),
      users: [
        UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
        }),
      ],
    });
    it('Should emit to user with current userId', () => {
      const { sut, currentUserClient } = makeSut();
      sut.clients.push({
        userId: 'any_user_id',
        client: currentUserClient,
      });
      sut.emitToUserRemovedFromGroup('any_user_id', group);
      expect(currentUserClient.emit).toBeCalledWith('remove-from-group', {
        id: 'any_group_id',
        description: 'any_group_description',
        users: [
          {
            id: 'any_user_id',
            email: 'any_user_email',
            name: 'any_user_name',
          },
        ],
        name: 'any_group_name',
        owner: {
          id: 'any_owner_id',
          email: 'any_owner_email',
          name: 'any_owner_name',
        },
      });
    });
  });
});
