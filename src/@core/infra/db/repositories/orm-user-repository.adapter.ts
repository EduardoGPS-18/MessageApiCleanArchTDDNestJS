import { UserEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { UserRepository } from '@domain/repositories';
import { In, Repository } from 'typeorm';

export class OrmUserRepositoryAdapter implements UserRepository {
  constructor(private ormRepository: Repository<UserEntity>) {}

  async findOneByEmail(email: string): Promise<UserEntity> {
    try {
      return await this.ormRepository.findOneBy({ email: email });
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

  async findOneById(id: string): Promise<UserEntity> {
    try {
      return await this.ormRepository.findOneBy({ id: id });
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }
  async findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    try {
      return await this.ormRepository.findBy({ id: In(idList) });
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

  async insert(user: UserEntity): Promise<void> {
    try {
      await this.ormRepository.save(user);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }

  async update(user: UserEntity): Promise<void> {
    try {
      await this.ormRepository.save(user);
    } catch (err) {
      throw new RepositoryError.OperationError();
    }
  }
}
