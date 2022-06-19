import { DataSource, Repository } from 'typeorm';
import { OrmMessageRepositoryAdapter } from '.';
import { MessageEntity, UserEntity } from '../../../../domain/entities';
import { RepositoryError } from '../../../../domain/errors/repository.error';
import { MessageScheme } from '../../typeorm/message';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

type SutTypes = {
  sut: OrmMessageRepositoryAdapter;
  ormMessageRepository: Repository<MessageEntity>;
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
    entities: [MessageScheme],
  });
  const ormMessageRepository = datasource.getRepository(MessageScheme);
  const sut = new OrmMessageRepositoryAdapter(ormMessageRepository);
  return { sut, ormMessageRepository };
};

describe('OrmMessageRepository Adapter', () => {
  describe('Insert', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        groupId: 'any_group_id',
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
        groupId: 'any_group_id',
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

  describe('Find by Group', () => {
    it('Should call dependencies correctly', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        groupId: 'any_group_id',
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest.spyOn(ormMessageRepository, 'findBy').mockResolvedValueOnce([]);
      await sut.findByGroup('any_group_id');
      expect(ormMessageRepository.findBy).toHaveBeenCalledWith({
        groupId: 'any_group_id',
      });
    });

    it('Should throw RepositoryError.OperationError if Repository throws', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        groupId: 'any_group_id',
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest
        .spyOn(ormMessageRepository, 'findBy')
        .mockRejectedValueOnce(new Error());
      const promise = sut.findByGroup('any_group_id');
      await expect(promise).rejects.toThrowError(
        RepositoryError.OperationError,
      );
    });

    it('Should returns same of orm', async () => {
      const { sut, ormMessageRepository } = makeSut();
      const message = MessageEntity.create({
        content: 'any_content',
        groupId: 'any_group_id',
        id: 'any_id',
        sender: UserEntity.create({
          email: 'any_email',
          id: 'any_id',
          name: 'any_name',
          password: 'any_password',
        }),
      });

      jest.spyOn(ormMessageRepository, 'findBy').mockResolvedValueOnce([
        MessageEntity.create({
          content: 'any_content_1',
          groupId: 'any_group_1',
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
          groupId: 'any_group_2',
          id: 'any_id_2',
          sender: UserEntity.create({
            id: 'any_user_id_2',
            email: 'any_email_2',
            name: 'any_name_2',
            password: 'any_password_2',
          }),
        }),
      ]);
      const messages = await sut.findByGroup('any_group_id');
      expect(messages).toEqual([
        MessageEntity.create({
          content: 'any_content_1',
          groupId: 'any_group_1',
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
          groupId: 'any_group_2',
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
});
