import { UserEntity } from '../entities';

export abstract class UserRepository {
  abstract insert(user: UserEntity): Promise<void>;
  abstract update(user: UserEntity): Promise<void>;
  abstract findOneByEmail(email: string): Promise<UserEntity>;
}
