import { DomainError } from '@domain/errors';
import {
  GroupRepository,
  MessageRepository,
  UserRepository,
} from '@domain/repositories';

export type DeleteMessageProps = {
  messageId: string;
  currentUserId: string;
  groupId: string;
};

export abstract class DeleteMessageUseCaseI {
  abstract execute(props: DeleteMessageProps): Promise<void>;
}

export class DeleteMessageUseCase implements DeleteMessageUseCaseI {
  constructor(
    private userRepository: UserRepository,
    private groupRepository: GroupRepository,
    private messageRepository: MessageRepository,
  ) {}

  async execute(props: DeleteMessageProps): Promise<void> {
    const { currentUserId, groupId, messageId } = props;
    try {
      const user = await this.userRepository.findOneById(currentUserId);
      if (!user) {
        throw new DomainError.InvalidUser();
      }
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw new DomainError.InvalidGroup();
      }
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new DomainError.InvalidMessage();
      }

      if (!message.isSender(user)) {
        throw new DomainError.CurrentUserIsntMessageOwner();
      }
      await this.messageRepository.delete(message);
    } catch (err) {
      if (
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.InvalidMessage ||
        err instanceof DomainError.CurrentUserIsntMessageOwner
      ) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
