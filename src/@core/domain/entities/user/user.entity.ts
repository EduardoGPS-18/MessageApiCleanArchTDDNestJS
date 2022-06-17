import { DateMetadataProps } from '../helpers';

export type CreateUserProps = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export class UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  private constructor(
    createUser: CreateUserProps,
    datemetadata: DateMetadataProps,
  ) {
    if (!createUser && !datemetadata) {
      // Used Form Orm
      return;
    }
    const { id, name, email, password } = createUser;
    const { createdAt, updatedAt } = datemetadata;
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props: CreateUserProps): UserEntity {
    const now = new Date();
    const metadata = { createdAt: now, updatedAt: now };
    return new UserEntity(props, metadata);
  }
}
