import { UserEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { OrmUserRepositoryAdapter } from '@infra/db/repositories';
import { UserSchema } from '@infra/db/typeorm';
import * as crypto from 'crypto';
import { DataSource, In, Repository } from 'typeorm';

type SutTypes = {
  ormUserRepository: Repository<UserEntity>;
  sut: OrmUserRepositoryAdapter;
  dataSource: DataSource;
};
const makeSut = async (): Promise<SutTypes> => {
  const dataSource = new DataSource({
    type: 'postgres',
    synchronize: true,
    database: 'message_db_tst',
    username: 'docker',
    host: 'localhost',
    password: 'senha123',
    port: 5432,
    logging: false,
    entities: [UserSchema],
  });
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const ormUserRepository = dataSource.getRepository(UserEntity);
  const sut = new OrmUserRepositoryAdapter(ormUserRepository);
  return { sut, ormUserRepository, dataSource };
};

describe('Orm User Repository adapter', () => {
  const mockedUser = {
    id: 'any_id',
    email: 'any_email',
    name: 'any_name',
    password: 'any_password',
    createdAt: new Date(),
    updatedAt: new Date(),
    session: 'any_session',
    updateSession(session: string): void {},
  };

  describe('FindOneByEmail', () => {
    it('Should call orm with correct values', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      await sut.findOneByEmail('any_email');
      expect(ormUserRepository.findOneBy).toHaveBeenCalledWith({
        email: 'any_email',
      });
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());

      const promise = sut.findOneByEmail('any_email');
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should return same of orm', async () => {
      const { sut, ormUserRepository } = await makeSut();

      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await sut.findOneByEmail(mockedUser.email);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('FindOneById', () => {
    it('Should call orm with correct values', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      await sut.findOneById('any_id');
      expect(ormUserRepository.findOneBy).toHaveBeenCalledWith({
        id: 'any_id',
      });
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());

      const promise = sut.findOneById('any_email');
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should return same of orm', async () => {
      const { sut, ormUserRepository } = await makeSut();

      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await sut.findOneById(mockedUser.id);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('FindUserListByIdList', () => {
    it('Should call orm with correct values', async () => {
      const { sut, ormUserRepository } = await makeSut();
      const uuidUser1 = crypto.randomUUID();
      const uuidUser2 = crypto.randomUUID();
      jest.spyOn(ormUserRepository, 'findBy');

      await sut.findUserListByIdList([uuidUser1, uuidUser2]);
      expect(ormUserRepository.findBy).toHaveBeenCalledWith({
        id: In([uuidUser1, uuidUser2]),
      });
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest
        .spyOn(ormUserRepository, 'findBy')
        .mockRejectedValueOnce(new Error());
      const uuidUser1 = crypto.randomUUID();
      const uuidUser2 = crypto.randomUUID();
      const promise = sut.findUserListByIdList([uuidUser1, uuidUser2]);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should return same of orm', async () => {
      const { sut, ormUserRepository } = await makeSut();

      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await sut.findOneById(mockedUser.id);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('Insert', () => {
    it('Should integrate correctly with orm', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest.spyOn(ormUserRepository, 'save').mockResolvedValueOnce(mockedUser);
      const result = await sut.insert(mockedUser);
      expect(ormUserRepository.save).toHaveBeenCalledWith(mockedUser);
      expect(result).toBeUndefined();
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest.spyOn(ormUserRepository, 'save').mockRejectedValueOnce(new Error());
      const promise = sut.insert(mockedUser);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('Update', () => {
    it('Should integrate correctly with orm', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest.spyOn(ormUserRepository, 'save').mockResolvedValueOnce(mockedUser);
      const result = await sut.update(mockedUser);
      expect(ormUserRepository.save).toHaveBeenCalledWith(mockedUser);
      expect(result).toBeUndefined();
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = await makeSut();
      jest.spyOn(ormUserRepository, 'save').mockRejectedValueOnce(new Error());
      const promise = sut.update(mockedUser);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });
});
