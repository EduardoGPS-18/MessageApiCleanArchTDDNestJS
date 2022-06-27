import { UserEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { OrmUserRepositoryAdapter } from '@infra/db/repositories';
import * as crypto from 'crypto';
import { In, Repository } from 'typeorm';

let repository: Repository<UserEntity> = jest.genMockFromModule('typeorm');

const mockedUser = UserEntity.create({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email',
  session: 'any_session',
  password: 'any_password',
});

type SutTypes = {
  ormUserRepository: Repository<UserEntity>;
  sut: OrmUserRepositoryAdapter;
};
const makeSut = (): SutTypes => {
  const ormUserRepository = repository;
  const sut = new OrmUserRepositoryAdapter(repository);

  ormUserRepository.findBy = jest.fn();
  ormUserRepository.save = jest.fn();
  ormUserRepository.findOneBy = jest.fn();

  return { sut, ormUserRepository };
};

describe('OrmUser || RepositoryAdapter || Suit', () => {
  describe('FindOneByEmail', () => {
    it('Should call orm with correct values', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      await sut.findOneByEmail('any_email');

      expect(ormUserRepository.findOneBy).toHaveBeenCalledWith({
        email: 'any_email',
      });
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());

      const promise = sut.findOneByEmail('any_email');

      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should return same of orm', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await sut.findOneByEmail(mockedUser.email);

      expect(user).toEqual(mockedUser);
    });
  });

  describe('FindOneById', () => {
    it('Should call orm with correct values', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      await sut.findOneById('any_id');

      expect(ormUserRepository.findOneBy).toHaveBeenCalledWith({
        id: 'any_id',
      });
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());

      const promise = sut.findOneById('any_email');

      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should return same of orm', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await sut.findOneById(mockedUser.id);

      expect(user).toEqual(mockedUser);
    });
  });

  describe('FindUserListByIdList', () => {
    it('Should call orm with correct values', async () => {
      const { sut, ormUserRepository } = makeSut();
      const uuidUser1 = crypto.randomUUID();
      const uuidUser2 = crypto.randomUUID();

      await sut.findUserListByIdList([uuidUser1, uuidUser2]);
      expect(ormUserRepository.findBy).toHaveBeenCalledWith({
        id: In([uuidUser1, uuidUser2]),
      });
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = makeSut();
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
      const { sut, ormUserRepository } = makeSut();

      jest
        .spyOn(ormUserRepository, 'findOneBy')
        .mockResolvedValueOnce(mockedUser);

      const user = await sut.findOneById(mockedUser.id);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('Insert', () => {
    it('Should integrate correctly with orm', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest.spyOn(ormUserRepository, 'save').mockResolvedValueOnce(mockedUser);

      const result = await sut.insert(mockedUser);

      expect(ormUserRepository.save).toHaveBeenCalledWith(mockedUser);
      expect(result).toBeUndefined();
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest.spyOn(ormUserRepository, 'save').mockRejectedValueOnce(new Error());

      const promise = sut.insert(mockedUser);

      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('Update', () => {
    it('Should integrate correctly with orm', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest.spyOn(ormUserRepository, 'save').mockResolvedValueOnce(mockedUser);

      const result = await sut.update(mockedUser);

      expect(ormUserRepository.save).toHaveBeenCalledWith(mockedUser);
      expect(result).toBeUndefined();
    });

    it('Should throw RepositoryError.OperationError if OrmRepository throws', async () => {
      const { sut, ormUserRepository } = makeSut();
      jest.spyOn(ormUserRepository, 'save').mockRejectedValueOnce(new Error());

      const promise = sut.update(mockedUser);

      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });
});
