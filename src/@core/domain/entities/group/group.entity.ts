import { DateMetadataProps } from '../helpers';
import { MessageEntity } from '../message';
import { UserEntity } from '../user';

export type CreateGroupProps = {
  id: string;
  name: string;
  description: string;
  owner: UserEntity;
  users: UserEntity[];
  messages: MessageEntity[];
};

export class GroupEntity {
  id: string;
  name: string;
  description: string;
  owner: UserEntity;
  users: UserEntity[];
  messages: MessageEntity[];
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
    const { id, name, description, owner, users, messages } = createGroupProps;
    const { createdAt, updatedAt } = dateMetadata;
    this.id = id;
    this.name = name;
    this.description = description;
    this.owner = owner;
    this.users = [...users];
    this.messages = [...messages];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isUserInGroup(user: UserEntity): boolean {
    if (user.id === this.owner.id) return true;
    return this.users.map((user) => user.id).includes(user.id);
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