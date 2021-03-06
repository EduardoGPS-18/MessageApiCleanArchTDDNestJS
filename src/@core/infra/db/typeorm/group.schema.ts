import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { EntitySchema } from 'typeorm';

export const GroupSchema = new EntitySchema<GroupEntity>({
  name: GroupEntity.name,
  tableName: 'group',
  target: GroupEntity,
  relations: {
    users: {
      target: UserEntity.name,
      eager: true,
      nullable: false,
      type: 'many-to-many',
      joinTable: {
        name: 'users-group',
        joinColumn: {
          name: 'group_id',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'user_id',
          referencedColumnName: 'id',
        },
      },
    },
    owner: {
      target: UserEntity.name,
      type: 'many-to-one',
      eager: true,
    },
    messages: {
      primary: true,
      default: [],
      target: MessageEntity.name,
      type: 'one-to-many',
      inverseSide: 'group',
      eager: false,
      joinColumn: true,
    },
  },
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      unique: true,
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    description: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    createdAt: {
      type: 'timestamp with time zone',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      type: 'timestamp with time zone',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
});
