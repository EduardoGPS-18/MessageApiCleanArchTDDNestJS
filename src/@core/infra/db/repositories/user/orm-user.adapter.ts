import { In, Repository } from 'typeorm';
import { UserEntity } from '../../../../../@core/domain/entities';
import { UserRepository } from '../../../../../@core/domain/repositories';

export class OrmUserRepositoryAdapter implements UserRepository {
  constructor(private ormRepository: Repository<UserEntity>) {}

  async findOneById(id: string): Promise<UserEntity> {
    return await this.ormRepository.findOneBy({ id: id });
  }
  async findUserListByIdList(idList: string[]): Promise<UserEntity[]> {
    return await this.ormRepository.findBy({ id: In(idList) });
  }

  async update(user: UserEntity): Promise<void> {
    await this.ormRepository.save(user);
  }

  async insert(user: UserEntity): Promise<void> {
    await this.ormRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    return await this.ormRepository.findOneBy({ email: email });
  }
}
