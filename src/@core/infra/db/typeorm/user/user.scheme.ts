import { EntitySchema } from 'typeorm';
import { UserEntity } from '../../../../domain/entities';

export const UserSchema = new EntitySchema<UserEntity>({
  name: 'user',
  target: UserEntity,
  columns: {
    id: {
      type: 'varchar',
      length: 255,
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
  },
});
