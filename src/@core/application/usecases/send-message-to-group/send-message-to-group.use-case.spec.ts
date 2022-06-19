import * as crypto from 'crypto';
import {
  GroupEntity,
  MessageEntity,
  UserEntity,
} from '../../../domain/entities';
import { DomainError } from '../../../domain/errors/domain.error';
import {
  GroupRepository,
  MessageRepository,
  UserRepository,
} from '../../../domain/repositories';
import { SendMessageToGroupUseCase } from './send-message-to-group.use-case';

jest.mock('crypto');

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

jest.spyOn(crypto, 'randomUUID').mockReturnValue('gen_uuid');

class GroupRepositoryStub implements GroupRepository {
  update(group: GroupEntity): Promise<void> {
    return;
  }
  findById(id: string): Promise<GroupEntity> {
    return Promise.resolve(
      GroupEntity.create({
        id: 'any_group',
        description: 'any_description',
        messages: [],
        name: 'any_name',
        owner: UserEntity.create({
          email: 'any_user_email',
          id: 'any_user_id',
          name: 'any_user_name',
          password: 'any_user_password',
          session: 'any_user_session',
        }),
        users: [],
      }),
    );
  }
  insert(group: GroupEntity): Promise<void> {
    return;
  }
}

class MessageRepositoryStub implements MessageRepository {
  insert(message: MessageEntity): Promise<void> {
    return;
  }
  findByGroup(group: GroupEntity): Promise<MessageEntity[]> {
    return;
  }
}

class UserRepositoryStub implements UserRepository {
  insert(user: UserEntity): Promise<void> {
    return;
  }
  update(user: UserEntity): Promise<void> {
    return;
  }
  findOneById(id: string): Promise<UserEntity> {
    return Promise.resolve(
      UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
    );
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return;
  }
  findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    return;
  }
}

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
  return { sut, groupRepository, userRepository, messageRepository };
};
describe('SendMessageToGroup Usecase', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, groupRepository, userRepository, messageRepository } =
      makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
      UserEntity.create({
        id: 'owner_id',
        email: 'owner_email',
        name: 'owner_name',
        password: 'owner_password',
      }),
    );
    jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(
      GroupEntity.create({
        id: 'any_group',
        description: 'any_description',
        messages: [],
        name: 'any_name',
        owner: UserEntity.create({
          id: 'owner_id',
          email: 'owner_email',
          name: 'owner_name',
          password: 'owner_password',
        }),
        users: [],
      }),
    );
    jest.spyOn(messageRepository, 'insert');

    await sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group',
      senderId: 'owner_id',
    });

    expect(groupRepository.findById).toHaveBeenCalledWith('any_group');
    expect(userRepository.findOneById).toHaveBeenCalledWith('owner_id');
    expect(messageRepository.insert).toHaveBeenCalledWith(
      MessageEntity.create({
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
          users: [],
        }),
        content: 'any_message',
        id: 'gen_uuid',
        sender: UserEntity.create({
          id: 'owner_id',
          email: 'owner_email',
          name: 'owner_name',
          password: 'owner_password',
        }),
      }),
    );
  });

  it('Should throw if sender isnt in group', async () => {
    const { sut, groupRepository, userRepository, messageRepository } =
      makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
      UserEntity.create({
        id: 'sender_out_of_group_id',
        email: 'sender_out_of_group_email',
        name: 'sender_out_of_group_name',
        password: 'sender_out_of_group_pass',
      }),
    );
    jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(
      GroupEntity.create({
        id: 'any_group_id',
        description: 'any_description',
        messages: [],
        name: 'any_name',
        owner: UserEntity.create({
          id: 'owner_id',
          email: 'owner_email',
          name: 'owner_name',
          password: 'owner_password',
        }),
        users: [],
      }),
    );

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.UserIsntInGroup);
  });

  it('Should throw InvalidUser if sender isnt valid', async () => {
    const { sut, userRepository, groupRepository } = makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(null);
    jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(
      GroupEntity.create({
        id: 'any_group_id',
        description: 'any_description',
        messages: [],
        name: 'any_name',
        owner: UserEntity.create({
          id: 'owner_id',
          email: 'owner_email',
          name: 'owner_name',
          password: 'owner_password',
        }),
        users: [],
      }),
    );

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidUser);
  });

  it('Should throw InvalidGroup if user isnt valid', async () => {
    const { sut, userRepository, groupRepository } = makeSut();
    jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
      UserEntity.create({
        id: 'sender_out_of_group_id',
        email: 'sender_out_of_group_email',
        name: 'sender_out_of_group_name',
        password: 'sender_out_of_group_pass',
      }),
    );
    jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(null);

    const promise = sut.execute({
      messageContent: 'any_message',
      groupId: 'any_group_id',
      senderId: 'sender_out_of_group_id',
    });

    await expect(promise).rejects.toThrowError(DomainError.InvalidGroup);
  });

  // it('Should throw DomainError.Unexpected to another repository error', async () => {
  //   const { sut, userRepository, groupRepository } = makeSut();
  //   jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
  //     UserEntity.create({
  //       id: 'sender_out_of_group_id',
  //       email: 'sender_out_of_group_email',
  //       name: 'sender_out_of_group_name',
  //       password: 'sender_out_of_group_pass',
  //     }),
  //   );
  //   jest.spyOn(groupRepository, 'findById').mockRejectedValueOnce(new Error());

  //   const promise = sut.execute({
  //     messageContent: 'any_message',
  //     groupId: 'any_group_id',
  //     senderId: 'sender_out_of_group_id',
  //   });

  //   await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  // });

  // it('Should throw DomainError.Unexpected to another repository error', async () => {
  //   const { sut, userRepository, groupRepository } = makeSut();
  //   jest
  //     .spyOn(userRepository, 'findOneById')
  //     .mockRejectedValueOnce(new Error());
  //   jest.spyOn(groupRepository, 'findById').mockRejectedValueOnce(
  //     GroupEntity.create({
  //       id: 'any_group_id',
  //       description: 'any_description',
  //       messages: [],
  //       name: 'any_name',
  //       owner: UserEntity.create({
  //         id: 'owner_id',
  //         email: 'owner_email',
  //         name: 'owner_name',
  //         password: 'owner_password',
  //       }),
  //       users: [],
  //     }),
  //   );

  //   const promise = sut.execute({
  //     messageContent: 'any_message',
  //     groupId: 'any_group_id',
  //     senderId: 'sender_out_of_group_id',
  //   });

  //   await expect(promise).rejects.toThrowError(DomainError.Unexpected);
  // });

  // it('Should add message to a group on operation succeed', async () => {
  //   const { sut, groupRepository, userRepository, messageRepository } =
  //     makeSut();
  //   jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
  //     UserEntity.create({
  //       id: 'owner_id',
  //       email: 'owner_email',
  //       name: 'owner_name',
  //       password: 'owner_password',
  //     }),
  //   );
  //   jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(
  //     GroupEntity.create({
  //       id: 'any_group_id',
  //       description: 'any_description',
  //       messages: [],
  //       name: 'any_name',
  //       owner: UserEntity.create({
  //         id: 'owner_id',
  //         email: 'owner_email',
  //         name: 'owner_name',
  //         password: 'owner_password',
  //       }),
  //       users: [],
  //     }),
  //   );

  //   const message = await sut.execute({
  //     messageContent: 'any_message',
  //     groupId: 'any_group_id',
  //     senderId: 'sender_out_of_group_id',
  //   });

  //   expect(message).toEqual(
  //     MessageEntity.create({
  //       id: 'gen_uuid',
  //       content: 'any_message',
  //       group: GroupEntity.create({
  //         id: 'any_group_id',
  //         description: 'any_description',
  //         messages: [],
  //         name: 'any_name',
  //         owner: UserEntity.create({
  //           id: 'owner_id',
  //           email: 'owner_email',
  //           name: 'owner_name',
  //           password: 'owner_password',
  //         }),
  //         users: [],
  //       }),
  //       sender: UserEntity.create({
  //         id: 'owner_id',
  //         email: 'owner_email',
  //         name: 'owner_name',
  //         password: 'owner_password',
  //       }),
  //     }),
  //   );
  // });

  // it('Should rethrow if message creation throw', async () => {
  //   const { sut, userRepository, groupRepository } = makeSut();
  //   jest.spyOn(userRepository, 'findOneById').mockResolvedValueOnce(
  //     UserEntity.create({
  //       id: 'owner_id',
  //       email: 'owner_email',
  //       name: 'owner_name',
  //       password: 'owner_password',
  //     }),
  //   );
  //   jest.spyOn(groupRepository, 'findById').mockResolvedValueOnce(
  //     GroupEntity.create({
  //       id: 'any_group_id',
  //       description: 'any_description',
  //       messages: [],
  //       name: 'any_name',
  //       owner: UserEntity.create({
  //         id: 'owner_id',
  //         email: 'owner_email',
  //         name: 'owner_name',
  //         password: 'owner_password',
  //       }),
  //       users: [],
  //     }),
  //   );

  //   const promise = sut.execute({
  //     messageContent: '',
  //     groupId: 'any_group_id',
  //     senderId: 'sender_out_of_group_id',
  //   });

  //   await expect(promise).rejects.toThrowError(DomainError.InvalidMessage);
  // });
});
