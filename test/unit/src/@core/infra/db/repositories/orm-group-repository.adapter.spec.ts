import { GroupEntity } from '@domain/entities';
import { UserEntity } from '@domain/entities/';
import { RepositoryError } from '@domain/errors';
import { OrmGroupRepositoryAdapter } from '@infra/db/repositories';
import { GroupSchema } from '@infra/db/typeorm';
import { DataSource, Repository } from 'typeorm';

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
  describe('Insert', () => {
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

      jest
        .spyOn(ormGroupRepository, 'save')
        .mockImplementationOnce(async () => {
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
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('Update', () => {
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

      jest
        .spyOn(ormGroupRepository, 'save')
        .mockImplementationOnce(async () => {
          return group;
        });
      await sut.update(group);
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
      const promise = sut.update(group);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('FindById', () => {
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

      jest
        .spyOn(ormGroupRepository, 'findOneBy')
        .mockImplementationOnce(async () => {
          return group;
        });
      await sut.findById('any_id');
      expect(ormGroupRepository.findOneBy).toHaveBeenCalledWith({
        id: 'any_id',
      });
    });

    it('Should return same of orm', async () => {
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

      jest
        .spyOn(ormGroupRepository, 'findOneBy')
        .mockImplementationOnce(async () => {
          return group;
        });
      const result = await sut.findById('any_id');
      expect(result).toEqual(group);
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

      jest
        .spyOn(ormGroupRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());
      const promise = sut.findById('any_id');
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });
});
