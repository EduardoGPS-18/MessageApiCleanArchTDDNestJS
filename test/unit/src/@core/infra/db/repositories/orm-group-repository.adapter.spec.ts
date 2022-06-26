import { GroupEntity } from '@domain/entities';
import { UserEntity } from '@domain/entities/';
import { RepositoryError } from '@domain/errors';
import { OrmGroupRepositoryAdapter } from '@infra/db/repositories';
import { Repository } from 'typeorm';

let repository: Repository<GroupEntity> = jest.genMockFromModule('typeorm');

type SutTypes = {
  sut: OrmGroupRepositoryAdapter;
  ormGroupRepository: Repository<GroupEntity>;
};
const makeSut = (): SutTypes => {
  const ormGroupRepository = repository;
  const sut = new OrmGroupRepositoryAdapter(ormGroupRepository);
  return { sut, ormGroupRepository };
};

describe('OrmGroup Repository Adapter', () => {
  beforeEach(() => {
    const { ormGroupRepository } = makeSut();
    ormGroupRepository.save = jest.fn();
    ormGroupRepository.findOneBy = jest.fn();
    ormGroupRepository.createQueryBuilder = jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnValue({
        innerJoinAndMapOne: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            getMany: jest.fn(),
          }),
        }),
      }),
    });
  });

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

  describe('FindByUser', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormGroupRepository } = makeSut();

      const mockedUser = UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
      });
      await sut.findByUser(mockedUser);
      expect(ormGroupRepository.createQueryBuilder).toBeCalledWith('group');
      expect(
        ormGroupRepository.createQueryBuilder('').innerJoin,
      ).toBeCalledWith(
        'users-group',
        'user-group',
        'user-group.group_id = group.id',
      );
      expect(
        ormGroupRepository.createQueryBuilder('').innerJoin('', '')
          .innerJoinAndMapOne,
      ).toBeCalledWith('group.owner', 'user', 'u', 'u.id = group.owner.id');

      expect(
        ormGroupRepository
          .createQueryBuilder('')
          .innerJoin('', '')
          .innerJoinAndMapOne('', '', '').innerJoin,
      ).toBeCalledWith(
        'user',
        'user',
        'user-group.user_id = :userId OR group.owner.id = :userId',
        {
          userId: 'any_user_id',
        },
      );
      expect(
        ormGroupRepository
          .createQueryBuilder('')
          .innerJoin('', '')
          .innerJoinAndMapOne('', '', '')
          .innerJoin('', '').getMany,
      ).toBeCalledTimes(1);
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

      ormGroupRepository.createQueryBuilder = jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoinAndMapOne: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              getMany: jest.fn().mockResolvedValueOnce([group, group]),
            }),
          }),
        }),
      });
      const result = await sut.findByUser(
        UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
        }),
      );
      expect(result).toEqual([group, group]);
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
        .spyOn(ormGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      const promise = sut.findByUser(
        UserEntity.create({
          id: 'another_user_id',
          email: 'another_user_email',
          name: 'another_user_name',
          password: 'another_user_password',
        }),
      );
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });
});
