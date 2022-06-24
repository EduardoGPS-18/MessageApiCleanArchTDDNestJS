import { MessageEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import { MessageRepository, UserRepository } from '@domain/repositories';

export type EditMessageProps = {
  messageId: string;
  newMessageContent: string;
  currentUserId: string;
};

export abstract class EditMessageUseCaseI {
  abstract execute(props: EditMessageProps): Promise<MessageEntity>;
}

export class EditMessageUseCase implements EditMessageUseCaseI {
  constructor(
    private userRepository: UserRepository,
    private messageRepository: MessageRepository,
  ) {}

  async execute(props: EditMessageProps): Promise<MessageEntity> {
    try {
      const { currentUserId, messageId, newMessageContent } = props;
      const message = await this.messageRepository.findById(messageId);
      const user = await this.userRepository.findOneById(currentUserId);

      if (!message.isSender(user)) {
        throw new DomainError.CurrentUserIsntMessageOwner();
      }
      message.updateMessageContent(newMessageContent);
      await this.messageRepository.update(message);
      return message;
    } catch (err) {
      if (err instanceof DomainError.CurrentUserIsntMessageOwner) {
        throw err;
      }
      throw new DomainError.Unexpected();
    }
  }
}
