import { DateMetadataProps } from '@domain/entities/helpers';

export type CreateUserProps = {
  id: string;
  name: string;
  email: string;
  password: string;
  session?: string;
};

export class UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  session?: string;
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
    const { id, name, email, password, session } = createUser;
    const { createdAt, updatedAt } = datemetadata;
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.session = session;
  }

  static create(props: CreateUserProps): UserEntity {
    const now = new Date();
    const metadata = { createdAt: now, updatedAt: now };
    return new UserEntity(props, metadata);
  }

  updateSession(session: string): void {
    this.session = session;
  }
}
