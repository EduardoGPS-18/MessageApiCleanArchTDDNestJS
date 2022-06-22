import { DeleteMessageGateway } from '.';
import { DeleteMessageUseCase } from '../../../../application/usecases/delete-message-of-group/delete-message-of-group.usecase';
import {
  GroupEntity,
  MessageEntity,
  UserEntity,
} from '../../../../domain/entities';
import {
  GroupRepository,
  MessageRepository,
  UserRepository,
} from '../../../../domain/repositories';

class UserRepositoryStub implements UserRepository {
  insert(user: UserEntity): Promise<void> {
    return;
  }
  update(user: UserEntity): Promise<void> {
    return;
  }
  findOneById(id: string): Promise<UserEntity> {
    return;
  }
  findOneByEmail(email: string): Promise<UserEntity> {
    return;
  }
  findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
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
  delete(message: MessageEntity): Promise<void> {
    return;
  }
  findById(id: string): Promise<MessageEntity> {
    return;
  }
}

class GroupRepositoryStub implements GroupRepository {
  insert(group: GroupEntity): Promise<void> {
    return;
  }
  update(group: GroupEntity): Promise<void> {
    return;
  }
  findById(id: string): Promise<GroupEntity> {
    return;
  }
}

type SutTypes = {
  sut: DeleteMessageGateway;
  deleteMessageUseCase: DeleteMessageUseCase;
};
const makeSut = () => {
  const userRepository = new UserRepositoryStub();
  const messageRepository = new MessageRepositoryStub();
  const groupRepository = new GroupRepositoryStub();
  const deleteMessageUseCase = new DeleteMessageUseCase(
    userRepository,
    groupRepository,
    messageRepository,
  );
  const sut = new DeleteMessageGateway(deleteMessageUseCase);
  return { sut, deleteMessageUseCase };
};

describe('Delete Message Gateway Suit', () => {
  it('Should call usecase correctly', async () => {
    const { sut } = makeSut();
  });
});
