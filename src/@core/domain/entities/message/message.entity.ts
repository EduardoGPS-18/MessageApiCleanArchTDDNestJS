import { UserEntity } from '..';
import { DateMetadataProps } from '../helpers';

export type CreateMessageProps = {
  id: string;
  sender: UserEntity;
  content: string;
};

export class MessageEntity {
  id: string;
  content: string;
  sender: UserEntity;
  createdAt: Date;
  updatedAt: Date;

  private constructor(
    props: CreateMessageProps,
    dateMetadata: DateMetadataProps,
  ) {
    if (!props && !dateMetadata) {
      return;
    }
    const { id, sender, content } = props;
    const { createdAt, updatedAt } = dateMetadata;
    this.id = id;
    this.content = content;
    this.sender = sender;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props: CreateMessageProps): MessageEntity {
    const { id, content, sender } = props;
    const now = new Date();
    return new MessageEntity(
      {
        id,
        content,
        sender,
      },
      {
        createdAt: now,
        updatedAt: now,
      },
    );
  }
}
