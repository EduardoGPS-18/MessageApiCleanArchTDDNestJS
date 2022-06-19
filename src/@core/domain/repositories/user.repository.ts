import { UserEntity } from '../entities/';

export abstract class UserRepository {
  abstract insert(user: UserEntity): Promise<void>;
  abstract update(user: UserEntity): Promise<void>;

  abstract findOneById(id: string): Promise<UserEntity>;
  abstract findOneByEmail(email: string): Promise<UserEntity>;
  abstract findUserListByIdList(idList: string[]): Promise<UserEntity[]>;
}
