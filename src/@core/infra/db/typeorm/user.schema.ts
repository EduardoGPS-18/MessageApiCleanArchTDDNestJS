import { UserEntity } from '@domain/entities';
import { EntitySchema } from 'typeorm';

export const UserSchema = new EntitySchema<UserEntity>({
  name: UserEntity.name,
  tableName: 'user',
  target: UserEntity,
  columns: {
    id: {
      type: 'uuid',
      nullable: false,
      primary: true,
      unique: true,
    },
    email: {
      type: 'varchar',
      nullable: false,
      unique: true,
      length: 255,
    },
    password: {
      type: 'varchar',
      nullable: false,
      length: 255,
    },
    name: {
      type: 'varchar',
      nullable: false,
      length: 255,
    },
    createdAt: {
      type: 'timestamp with time zone',
      nullable: false,
    },
    updatedAt: {
      type: 'timestamp with time zone',
      nullable: false,
    },
    session: {
      type: 'varchar',
      nullable: true,
      length: 255,
    },
  },
});
