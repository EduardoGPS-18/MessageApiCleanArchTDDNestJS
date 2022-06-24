import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { RepositoryError } from '@domain/errors';
import { OrmMessageRepositoryAdapter } from '@infra/db/repositories';
import { Repository } from 'typeorm';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
let repository: Repository<MessageEntity> = jest.genMockFromModule('typeorm');

type SutTypes = {
  sut: OrmMessageRepositoryAdapter;
  ormMessageRepository: Repository<MessageEntity>;
};
const makeSut = (): SutTypes => {
  const ormMessageRepository = repository;
  const sut = new OrmMessageRepositoryAdapter(ormMessageRepository);
  return { sut, ormMessageRepository };
};

describe('OrmMessageRepository Adapter', () => {
  beforeEach(() => {
    const { ormMessageRepository } = makeSut();
    ormMessageRepository.createQueryBuilder = jest.fn().mockReturnValue({
      andWhere: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnValueOnce({
          getMany: jest.fn().mockReturnValueOnce([]),
        }),
      }),
    });
    ormMessageRepository.findBy = jest.fn();
    ormMessageRepository.save = jest.fn();
    ormMessageRepository.remove = jest.fn();
    ormMessageRepository.findOneBy = jest.fn();
  });

  describe('Insert', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
          users: [],
        }),
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest
        .spyOn(ormMessageRepository, 'save')
        .mockImplementationOnce(async () => {
          return message;
        });
      await sut.insert(message);
      expect(ormMessageRepository.save).toHaveBeenCalledWith(message);
    });

    it('Should throw RepositoryError.OperationError if Repository throws', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
          users: [],
        }),
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest
        .spyOn(ormMessageRepository, 'save')
        .mockRejectedValueOnce(new Error());
      const promise = sut.insert(message);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('Update', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
          users: [],
        }),
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest.spyOn(ormMessageRepository, 'save');
      await sut.update(message);
      expect(ormMessageRepository.save).toHaveBeenCalledWith(message);
    });

    it('Should throw RepositoryError.OperationError if Repository throws', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
          users: [],
        }),
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest
        .spyOn(ormMessageRepository, 'save')
        .mockRejectedValueOnce(new Error());
      const promise = sut.update(message);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('Delete', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
          users: [],
        }),
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      await sut.delete(message);
      expect(ormMessageRepository.remove).toHaveBeenCalledWith(message);
    });

    it('Should throw RepositoryError.OperationError if Repository throws', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        group: GroupEntity.create({
          id: 'any_group',
          description: 'any_description',
          messages: [],
          name: 'any_name',
          owner: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
          users: [],
        }),
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest
        .spyOn(ormMessageRepository, 'remove')
        .mockRejectedValueOnce(new Error());
      const promise = sut.delete(message);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });
  });

  describe('Find by Group', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormMessageRepository } = makeSut();
      ormMessageRepository.createQueryBuilder = jest.fn().mockReturnValue({
        andWhere: jest.fn().mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnValue({
            getMany: jest.fn().mockReturnValue([]),
          }),
        }),
      });
      const group = GroupEntity.create({
        id: 'any_group',
        description: 'any_description',
        messages: [],
        name: 'any_name',
        owner: UserEntity.create({
          id: 'owner_id',
          email: 'owner_email',
          name: 'owner_name',
          password: 'owner_password',
        }),
        users: [],
      });

      await sut.findByGroup(group);
      expect(ormMessageRepository.createQueryBuilder).toHaveBeenCalledWith(
        'message',
      );
      expect(
        ormMessageRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledWith('message.groupId = :groupId', {
        groupId: group.id,
      });

      expect(
        ormMessageRepository.createQueryBuilder().andWhere('any_where')
          .leftJoinAndSelect,
      ).toHaveBeenCalledWith('message.sender', 'user');
      expect(
        ormMessageRepository
          .createQueryBuilder()
          .andWhere('any_where')
          .leftJoinAndSelect('any_join', 'any_alias').getMany,
      ).toHaveBeenCalledTimes(1);
    });

    it('Should throw RepositoryError.OperationError if Repository throws', async () => {
      const { sut, ormMessageRepository } = makeSut();
      ormMessageRepository.createQueryBuilder = jest.fn().mockReturnValueOnce({
        andWhere: jest.fn().mockReturnValueOnce({
          getMany: jest.fn().mockRejectedValueOnce(new Error()),
        }),
      });
      const group = GroupEntity.create({
        id: 'any_group',
        description: 'any_description',
        messages: [],
        name: 'any_name',
        owner: UserEntity.create({
          id: 'owner_id',
          email: 'owner_email',
          name: 'owner_name',
          password: 'owner_password',
        }),
        users: [],
      });

      jest
        .spyOn(ormMessageRepository, 'findBy')
        .mockRejectedValueOnce(new Error());
      const promise = sut.findByGroup(group);
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should returns same of orm', async () => {
      const { sut, ormMessageRepository } = makeSut();
      ormMessageRepository.createQueryBuilder = jest.fn().mockReturnValueOnce({
        andWhere: jest.fn().mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnValueOnce({
            getMany: jest.fn().mockReturnValueOnce([
              MessageEntity.create({
                content: 'any_content_1',
                group: GroupEntity.create({
                  id: 'any_group',
                  description: 'any_description',
                  messages: [],
                  name: 'any_name',
                  owner: UserEntity.create({
                    id: 'owner_id',
                    email: 'owner_email',
                    name: 'owner_name',
                    password: 'owner_password',
                  }),
                  users: [],
                }),
                id: 'any_id_1',
                sender: UserEntity.create({
                  id: 'any_user_id_1',
                  email: 'any_email_1',
                  name: 'any_name_1',
                  password: 'any_password_1',
                }),
              }),
              MessageEntity.create({
                content: 'any_content_2',
                group: GroupEntity.create({
                  id: 'any_group',
                  description: 'any_description',
                  messages: [],
                  name: 'any_name',
                  owner: UserEntity.create({
                    id: 'owner_id',
                    email: 'owner_email',
                    name: 'owner_name',
                    password: 'owner_password',
                  }),
                  users: [],
                }),
                id: 'any_id_2',
                sender: UserEntity.create({
                  id: 'any_user_id_2',
                  email: 'any_email_2',
                  name: 'any_name_2',
                  password: 'any_password_2',
                }),
              }),
            ]),
          }),
        }),
      });
      const group = GroupEntity.create({
        id: 'any_group',
        description: 'any_description',
        messages: [],
        name: 'any_name',
        owner: UserEntity.create({
          id: 'owner_id',
          email: 'owner_email',
          name: 'owner_name',
          password: 'owner_password',
        }),
        users: [],
      });
      const messages = await sut.findByGroup(group);
      expect(messages).toEqual([
        MessageEntity.create({
          content: 'any_content_1',
          group: GroupEntity.create({
            id: 'any_group',
            description: 'any_description',
            messages: [],
            name: 'any_name',
            owner: UserEntity.create({
              id: 'owner_id',
              email: 'owner_email',
              name: 'owner_name',
              password: 'owner_password',
            }),
            users: [],
          }),
          id: 'any_id_1',
          sender: UserEntity.create({
            id: 'any_user_id_1',
            email: 'any_email_1',
            name: 'any_name_1',
            password: 'any_password_1',
          }),
        }),
        MessageEntity.create({
          content: 'any_content_2',
          group: GroupEntity.create({
            id: 'any_group',
            description: 'any_description',
            messages: [],
            name: 'any_name',
            owner: UserEntity.create({
              id: 'owner_id',
              email: 'owner_email',
              name: 'owner_name',
              password: 'owner_password',
            }),
            users: [],
          }),
          id: 'any_id_2',
          sender: UserEntity.create({
            id: 'any_user_id_2',
            email: 'any_email_2',
            name: 'any_name_2',
            password: 'any_password_2',
          }),
        }),
      ]);
    });
  });

  describe('Find by Id', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormMessageRepository } = makeSut();
      await sut.findById('any_message_id');
      expect(ormMessageRepository.findOneBy).toHaveBeenCalledWith({
        id: 'any_message_id',
      });
    });

    it('Should throw RepositoryError.OperationError if Repository throws', async () => {
      const { sut, ormMessageRepository } = makeSut();
      jest
        .spyOn(ormMessageRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());
      const promise = sut.findById('any_group_id');
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should returns same of orm', async () => {
      const { sut, ormMessageRepository } = makeSut();
      jest.spyOn(ormMessageRepository, 'findOneBy').mockResolvedValueOnce(
        MessageEntity.create({
          id: 'any_message_id',
          content: 'any_message_content',
          group: GroupEntity.create({
            users: [],
            id: 'any_group',
            description: 'any_description',
            messages: [],
            name: 'any_name',
            owner: UserEntity.create({
              id: 'owner_id',
              email: 'owner_email',
              name: 'owner_name',
              password: 'owner_password',
            }),
          }),
          sender: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
        }),
      );
      const messages = await sut.findById('any_message_id');
      expect(messages).toEqual(
        MessageEntity.create({
          id: 'any_message_id',
          content: 'any_message_content',
          group: GroupEntity.create({
            users: [],
            id: 'any_group',
            description: 'any_description',
            messages: [],
            name: 'any_name',
            owner: UserEntity.create({
              id: 'owner_id',
              email: 'owner_email',
              name: 'owner_name',
              password: 'owner_password',
            }),
          }),
          sender: UserEntity.create({
            id: 'owner_id',
            email: 'owner_email',
            name: 'owner_name',
            password: 'owner_password',
          }),
        }),
      );
    });
  });
});
