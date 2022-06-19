import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../../../domain/entities/';
import { GroupEntity } from '../../../../domain/entities/group';
import { RepositoryError } from '../../../../domain/errors/repository.error';
import { GroupSchema } from '../../typeorm/group';
import { OrmGroupRepositoryAdapter } from './orm-group-repository.adapter';

type SutTypes = {
  sut: OrmGroupRepositoryAdapter;
  ormGroupRepository: Repository<GroupEntity>;
};
const makeSut = (): SutTypes => {
  const datasource = new DataSource({
    type: 'postgres',
    synchronize: true,
    database: 'message_db_tst',
    username: 'docker',
    host: 'localhost',
    password: 'senha123',
    port: 5432,
    logging: false,
    entities: [GroupSchema],
  });
  const ormGroupRepository = datasource.getRepository(GroupSchema);
  const sut = new OrmGroupRepositoryAdapter(ormGroupRepository);
  return { sut, ormGroupRepository };
};

describe('OrmGroup Repository Adapter', () => {
  it('Should call dependencies correctly', async () => {
    const { sut, ormGroupRepository } = makeSut();
    const group = GroupEntity.create({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      messages: [],
      owner: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      users: [],
    });

    jest.spyOn(ormGroupRepository, 'save').mockImplementationOnce(async () => {
      return group;
    });
    await sut.insert(group);
    expect(ormGroupRepository.save).toHaveBeenCalledWith(group);
  });

  it('Should throw RepositoryError.OperationError if RepositoryError', async () => {
    const { sut, ormGroupRepository } = makeSut();
    const group = GroupEntity.create({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      messages: [],
      owner: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
      }),
      users: [],
    });

    jest.spyOn(ormGroupRepository, 'save').mockRejectedValueOnce(new Error());
    const promise = sut.insert(group);
    await expect(promise).rejects.toThrowError(RepositoryError.OperationError);
  });
});
