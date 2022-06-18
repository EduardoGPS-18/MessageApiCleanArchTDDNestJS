import { EntitySchema } from 'typeorm';
import { GroupEntity } from '../../../../domain/entities/group';
import { UserSchema } from '../user';

export const GroupScheme = new EntitySchema<GroupEntity>({
  name: GroupEntity.name,
  tableName: 'group',
  target: GroupEntity,
  synchronize: true,
  relations: {
    // users: {
    //   target: UserSchema,
    //   eager: true,
    //   nullable: false,
    //   type: 'many-to-many',
    //   joinTable: {
    //     name: 'users-group',
    //     joinColumn: {
    //       name: 'group_id',
    //       referencedColumnName: 'id',
    //     },
    //     inverseJoinColumn: {
    //       name: 'user_id',
    //       referencedColumnName: 'id',
    //     },
    //   },
    // },
    owner: {
      target: UserSchema,
      type: 'many-to-one',
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
