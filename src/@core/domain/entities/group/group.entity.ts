import { DateMetadataProps } from '../helpers';
import { UserEntity } from '../user';

export type CreateGroupProps = {
  id: string;
  name: string;
  description: string;
  owner: UserEntity;
  users: UserEntity[];
};

export class GroupEntity {
  id: string;
  name: string;
  description: string;
  owner: UserEntity;
  users: UserEntity[];
  createdAt: Date;
  updatedAt: Date;

  private constructor(
    createGroupProps: CreateGroupProps,
    dateMetadata: DateMetadataProps,
  ) {
    if (!createGroupProps && !dateMetadata) {
      // Used by orm's
      return;
    }
    const { id, name, description, owner, users } = createGroupProps;
    const { createdAt, updatedAt } = dateMetadata;
    this.id = id;
    this.name = name;
    this.description = description;
    this.owner = owner;
    this.users = users;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  addUserListOnGroup(users: UserEntity[]) {
    users.map((user) => {
      if (!this.users.includes(user)) {
        this.users.push(user);
      }
    });
  }

  public static create(createGroupProps: CreateGroupProps): GroupEntity {
    const now = new Date();
    return new GroupEntity(
      { ...createGroupProps },
      { createdAt: now, updatedAt: now },
    );
  }
}
