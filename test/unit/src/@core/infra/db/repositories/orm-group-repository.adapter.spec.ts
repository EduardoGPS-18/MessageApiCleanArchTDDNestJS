import { GroupEntity } from '@domain/entities';
import { UserEntity } from '@domain/entities/';
import { RepositoryError } from '@domain/errors';
import { OrmGroupRepositoryAdapter } from '@infra/db/repositories';
import { Repository } from 'typeorm';

let repository: Repository<GroupEntity> = jest.genMockFromModule('typeorm');

const mockedUser = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
});

const anotherMockedUser = UserEntity.create({
  id: 'another_user_id',
  email: 'another_user_email',
  name: 'another_user_name',
  password: 'another_user_password',
});

const mockedGroup = GroupEntity.create({
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

type SutTypes = {
  sut: OrmGroupRepositoryAdapter;
  ormGroupRepository: Repository<GroupEntity>;
};
const makeSut = (): SutTypes => {
  const ormGroupRepository = repository;
  const sut = new OrmGroupRepositoryAdapter(ormGroupRepository);

  ormGroupRepository.save = jest.fn();
  ormGroupRepository.findOneBy = jest.fn();
  ormGroupRepository.createQueryBuilder = jest.fn().mockReturnValue({
    leftJoin: jest.fn().mockReturnValue({
      leftJoinAndMapOne: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          getMany: jest.fn(),
        }),
      }),
    }),
  });

  return { sut, ormGroupRepository };
};

describe('OrmGroup || RepositoryAdapter || Suit', () => {
  describe('Insert', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormGroupRepository } = makeSut();
      jest
        .spyOn(ormGroupRepository, 'save')
        .mockImplementationOnce(async () => {
          return mockedGroup;
        });

      await sut.insert(mockedGroup);

      expect(ormGroupRepository.save).toHaveBeenCalledWith(mockedGroup);
    });

    it('Should throw RepositoryError.OperationError if RepositoryError', async () => {
      const { sut, ormGroupRepository } = makeSut();
      jest.spyOn(ormGroupRepository, 'save').mockRejectedValueOnce(new Error());

      const promise = sut.insert(mockedGroup);

      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('Update', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormGroupRepository } = makeSut();
      jest
        .spyOn(ormGroupRepository, 'save')
        .mockImplementationOnce(async () => {
          return mockedGroup;
        });

      await sut.update(mockedGroup);

      expect(ormGroupRepository.save).toHaveBeenCalledWith(mockedGroup);
    });

    it('Should throw RepositoryError.OperationError if RepositoryError', async () => {
      const { sut, ormGroupRepository } = makeSut();
      jest.spyOn(ormGroupRepository, 'save').mockRejectedValueOnce(new Error());

      const promise = sut.update(mockedGroup);

      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('FindById', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormGroupRepository } = makeSut();
      jest
        .spyOn(ormGroupRepository, 'findOneBy')
        .mockImplementationOnce(async () => {
          return mockedGroup;
        });

      await sut.findById('any_id');

      expect(ormGroupRepository.findOneBy).toHaveBeenCalledWith({
        id: 'any_id',
      });
    });

    it('Should return same of orm', async () => {
      const { sut, ormGroupRepository } = makeSut();
      jest
        .spyOn(ormGroupRepository, 'findOneBy')
        .mockImplementationOnce(async () => {
          return mockedGroup;
        });

      const result = await sut.findById('any_id');

      expect(result).toEqual(mockedGroup);
    });

    it('Should throw RepositoryError.OperationError if RepositoryError', async () => {
      const { sut, ormGroupRepository } = makeSut();
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

      await sut.findByUser(mockedUser);

      expect(ormGroupRepository.createQueryBuilder).toBeCalledWith('group');
      expect(ormGroupRepository.createQueryBuilder('').leftJoin).toBeCalledWith(
        'users-group',
        'user-group',
        'user-group.group_id = group.id',
      );
      expect(
        ormGroupRepository.createQueryBuilder('').leftJoin('', '')
          .leftJoinAndMapOne,
      ).toBeCalledWith('group.owner', 'user', 'u', 'u.id = group.owner.id');
      expect(
        ormGroupRepository
          .createQueryBuilder('')
          .leftJoin('', '')
          .leftJoinAndMapOne('', '', '').innerJoin,
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
          .leftJoin('', '')
          .leftJoinAndMapOne('', '', '')
          .innerJoin('', '').getMany,
      ).toBeCalledTimes(1);
    });

    it('Should return same of orm', async () => {
      const { sut, ormGroupRepository } = makeSut();
      ormGroupRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnValue({
          leftJoinAndMapOne: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              getMany: jest
                .fn()
                .mockResolvedValueOnce([mockedGroup, mockedGroup]),
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

      expect(result).toEqual([mockedGroup, mockedGroup]);
    });

    it('Should throw RepositoryError.OperationError if RepositoryError', async () => {
      const { sut, ormGroupRepository } = makeSut();
      jest
        .spyOn(ormGroupRepository, 'createQueryBuilder')
        .mockImplementationOnce(() => {
          throw new Error();
        });

      const promise = sut.findByUser(anotherMockedUser);

      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });
});
