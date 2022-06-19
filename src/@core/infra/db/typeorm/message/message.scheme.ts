import { EntitySchema } from 'typeorm';
import {
  GroupEntity,
  MessageEntity,
  UserEntity,
} from '../../../../domain/entities';

export const MessageScheme = new EntitySchema<MessageEntity>({
  name: MessageEntity.name,
  tableName: 'message',
  target: MessageEntity,
  synchronize: true,
  relations: {
    sender: {
      target: UserEntity.name,
      type: 'many-to-one',

      createForeignKeyConstraints: true,
      eager: true,
    },
    group: {
      target: GroupEntity.name,
      type: 'many-to-one',
      inverseSide: 'messages',
    },
  },
  columns: {
    content: {
      type: 'text',
      nullable: false,
    },
    createdAt: {
      type: 'timestamp',
      nullable: false,
    },
    id: {
      type: 'uuid',
      primary: true,
      nullable: false,
      unique: true,
    },
    updatedAt: {
      type: 'timestamp',
      nullable: false,
    },
  },
});
