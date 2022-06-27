import { UserEntity } from '@domain/entities';
import { UserRepository } from '@domain/repositories';

export class UserRepositoryStub implements UserRepository {
  insert: (user: UserEntity) => Promise<void> = jest.fn();

  update: (user: UserEntity) => Promise<void> = jest.fn();

  findOneById: (id: string) => Promise<UserEntity> = jest.fn();

  findOneByEmail: (email: string) => Promise<UserEntity> = jest.fn();

  findUserListByIdList: (idList: string[]) => Promise<UserEntity[]> = jest.fn();
}
