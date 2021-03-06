import { MessageEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  GroupRepository,
  MessageRepository,
  UserRepository,
} from '@domain/repositories';
import * as crypto from 'crypto';

export type SendMessageToGroupProps = {
  groupId: string;
  messageContent: string;
  senderId: string;
};

export abstract class SendMessageToGroupUseCaseI {
  abstract execute(props: SendMessageToGroupProps): Promise<MessageEntity>;
}

export class SendMessageToGroupUseCase implements SendMessageToGroupUseCaseI {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userRepository: UserRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(props: SendMessageToGroupProps): Promise<MessageEntity> {
    try {
      const { groupId, messageContent, senderId } = props;

      const sender = await this.userRepository.findOneById(senderId);
      const group = await this.groupRepository.findById(groupId);

      if (!sender) {
        throw new DomainError.InvalidUser();
      } else if (!group) {
        throw new DomainError.InvalidGroup();
      }
      const message = MessageEntity.create({
        content: messageContent,
        group: group,
        sender: sender,
        id: crypto.randomUUID(),
      });
      if (!group.isUserInGroup(sender)) {
        throw new DomainError.UserIsntInGroup();
      }
      await this.messageRepository.insert(message);

      return message;
    } catch (err) {
      if (
        err instanceof DomainError.UserIsntInGroup ||
        err instanceof DomainError.InvalidUser ||
        err instanceof DomainError.InvalidGroup ||
        err instanceof DomainError.InvalidMessage
      ) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
