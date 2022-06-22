import { GroupEntity, UserEntity } from '..';
import { DomainError } from '../../errors/domain.error';
import { DateMetadataProps } from '../helpers';

export type CreateMessageProps = {
  id: string;
  sender: UserEntity;
  group: GroupEntity;
  content: string;
};

export class MessageEntity {
  id: string;
  content: string;
  sender: UserEntity;
  group: GroupEntity;
  createdAt: Date;
  updatedAt: Date;

  private constructor(
    props: CreateMessageProps,
    dateMetadata: DateMetadataProps,
  ) {
    if (!props && !dateMetadata) {
      return;
    }
    const { id, sender, content, group } = props;
    const { createdAt, updatedAt } = dateMetadata;
    this.id = id;
    this.content = content;
    this.sender = sender;
    this.group = group;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isSender(user: UserEntity): boolean {
    if (user.id === this.sender.id) {
      return true;
    } else {
      return false;
    }
  }

  static create(props: CreateMessageProps): MessageEntity {
    const { id, content, sender, group } = props;
    const now = new Date();

    if (!content) throw new DomainError.InvalidMessage();

    return new MessageEntity(
      {
        id,
        content,
        sender,
        group,
      },
      {
        createdAt: now,
        updatedAt: now,
      },
    );
  }
}
