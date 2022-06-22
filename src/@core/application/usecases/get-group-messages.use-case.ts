import { MessageEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  GroupRepository,
  MessageRepository,
  UserRepository,
} from '@domain/repositories';

export type GetGroupMessageProps = {
  groupId: string;
  userId: string;
};

export abstract class GetGroupMessageListUseCaseI {
  abstract execute({ groupId }: GetGroupMessageProps): Promise<MessageEntity[]>;
}

export class GetGroupMessageListUseCase implements GetGroupMessageListUseCaseI {
  constructor(
    private groupRepository: GroupRepository,
    private messageRepository: MessageRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    groupId,
    userId,
  }: GetGroupMessageProps): Promise<MessageEntity[]> {
    try {
      const group = await this.groupRepository.findById(groupId);
      const user = await this.userRepository.findOneById(userId);

      if (!user) throw new DomainError.InvalidUser();
      if (!group) throw new DomainError.InvalidGroup();
      if (!group.isUserInGroup(user)) throw new DomainError.UserIsntInGroup();
      const messages = await this.messageRepository.findByGroup(group);

      return messages;
    } catch (err) {
      if (
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.UserIsntInGroup ||
        err instanceof DomainError.InvalidUser
      ) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
