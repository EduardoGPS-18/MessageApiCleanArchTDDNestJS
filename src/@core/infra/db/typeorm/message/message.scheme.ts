import { EntitySchema } from 'typeorm';
import { MessageEntity } from '../../../../domain/entities';
import { UserSchema } from '../user';

export const MessageScheme = new EntitySchema<MessageEntity>({
  name: MessageEntity.name,
  tableName: 'message',
  target: MessageEntity,
  synchronize: true,
  relations: {
    sender: {
      target: UserSchema,
      type: 'many-to-one',
      createForeignKeyConstraints: true,
      eager: true,
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
