import { UserEntity } from '..';
import { DomainError } from '../../errors/domain.error';
import { DateMetadataProps } from '../helpers';

export type CreateMessageProps = {
  id: string;
  sender: UserEntity;
  groupId: string;
  content: string;
};

export class MessageEntity {
  id: string;
  content: string;
  sender: UserEntity;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(
    props: CreateMessageProps,
    dateMetadata: DateMetadataProps,
  ) {
    if (!props && !dateMetadata) {
      return;
    }
    const { id, sender, content, groupId } = props;
    const { createdAt, updatedAt } = dateMetadata;
    this.id = id;
    this.content = content;
    this.sender = sender;
    this.groupId = groupId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props: CreateMessageProps): MessageEntity {
    const { id, content, sender, groupId } = props;
    const now = new Date();

    if (!content) throw new DomainError.InvalidMessage();

    return new MessageEntity(
      {
        id,
        content,
        sender,
        groupId,
      },
      {
        createdAt: now,
        updatedAt: now,
      },
    );
  }
}
